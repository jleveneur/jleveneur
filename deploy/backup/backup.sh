#!/usr/bin/env bash
# Nightly backup of the VPS's shared services to the backup bucket on
# Cloudflare R2, run on the server by jleveneur-backup.timer:
#
#   umami        `pg_dump -Fc` of its Postgres, checked with `pg_restore --list`
#                → umami/postgres/umami-<UTC time>.dump
#   uptime-kuma  an online SQLite copy of kuma.db, checked with
#                `PRAGMA integrity_check` → uptime-kuma/kuma-<UTC time>.db.gz
#   beszel       the same for the hub's data.db, plus id_ed25519, the hub's
#                key its agents know (losing it means re-adding every agent)
#                → beszel/beszel-<UTC time>.tar.gz
#
# The SQLite copies use the backup API (`.backup`), safe while the services
# write. Neither the Beszel hub's image nor a spare tool on the host has
# `sqlite3`, so both copies run in a throwaway container from the Uptime Kuma
# image already on the server, which has it, with the volume mounted
# read-only and no network.
#
# Each service is backed up on its own: one failing does not stop the others,
# and the script exits non-zero if any did. With HEARTBEAT_URL set (an Uptime
# Kuma push monitor), it is pinged only when all succeeded.
#
# The bucket refuses to overwrite or delete any object for 30 days (its lock
# rule) and deletes objects after 90 (its lifecycle rule). It also holds
# Hydromag's database backups, uploaded from that repository.
#
# Environment:
#   from /srv/backup/r2.env (deploy, 600), written by deploy/vps/r2-key.sh:
#     R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET
#   from /srv/backup/backup.env (deploy, 600), optional:
#     HEARTBEAT_URL  the Uptime Kuma push monitor
#
# Restoring, on the server as `deploy`. List and fetch with:
#
#   set -a; . /srv/backup/r2.env; set +a
#   r2() { curl -fsS --aws-sigv4 "aws:amz:auto:s3" \
#     --user "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" "$R2_ENDPOINT/$R2_BUCKET$1"; }
#   r2 "?list-type=2&prefix=umami/" | grep -o '<Key>[^<]*</Key>'
#   r2 "/umami/postgres/umami-<UTC time>.dump" > umami.dump
#
# Umami, into the running stack (overwrites its data):
#   docker exec -i umami-db-1 pg_restore -U umami -d umami \
#     --clean --if-exists --no-owner --single-transaction < umami.dump
#
# Uptime Kuma or Beszel: stop the service, put the file back in its volume,
# start it again. For Kuma (kuma.db in uptime-kuma_data):
#   cd /srv/uptime-kuma && docker compose stop
#   gunzip -c kuma-<UTC time>.db.gz > kuma.db
#   docker run --rm -v uptime-kuma_data:/data -v "$PWD:/in:ro" --entrypoint sh \
#     <the Kuma image> -c 'rm -f /data/kuma.db-wal /data/kuma.db-shm && cp /in/kuma.db /data/kuma.db'
#   docker compose start
# For Beszel, the same with beszel_data, data.db and id_ed25519 from the tarball,
# and the hub's image to stop (`cd /srv/beszel`).

set -uo pipefail

: "${R2_ACCESS_KEY_ID:?set R2_ACCESS_KEY_ID}"
: "${R2_SECRET_ACCESS_KEY:?set R2_SECRET_ACCESS_KEY}"
: "${R2_ENDPOINT:?set R2_ENDPOINT}"
: "${R2_BUCKET:?set R2_BUCKET}"

log() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }

work="$(mktemp -d --tmpdir jleveneur-backup.XXXXXX)"
trap 'rm -rf "$work"' EXIT
stamp="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
failed=()

# upload <file> <key>: a signed PUT, and only a 200 counts.
upload() {
  local file="$1" key="$2" status sha256
  sha256="$(sha256sum "$file" | cut -d ' ' -f 1)"
  status="$(curl --silent --show-error \
    --aws-sigv4 "aws:amz:auto:s3" \
    --user "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" \
    --header "x-amz-content-sha256: $sha256" \
    --upload-file "$file" \
    --output "$work/response" --write-out '%{http_code}' \
    "$R2_ENDPOINT/$R2_BUCKET/$key")"
  if [ "$status" != 200 ]; then
    log "R2 refused $key (HTTP $status):" >&2
    cat "$work/response" >&2
    return 1
  fi
  log "stored $(stat -c %s "$file") bytes at $R2_BUCKET/$key"
}

# sqlite_copy <volume> <file in the volume> <output directory>: an online copy,
# checked, in a throwaway container from the Kuma image.
sqlite_copy() {
  local volume="$1" file="$2" out="$3" image
  image="$(docker inspect -f '{{.Config.Image}}' uptime-kuma-uptime-kuma-1)" || return 1
  docker run --rm --network none --user "$(id -u):$(id -g)" \
    -v "$volume:/data:ro" -v "$out:/out" --entrypoint sh "$image" -c '
      set -e
      sqlite3 "file:/data/$1?mode=ro" ".backup /out/$1"
      check="$(sqlite3 "/out/$1" "PRAGMA integrity_check")"
      [ "$check" = ok ] || { echo "integrity check: $check" >&2; exit 1; }
    ' _ "$file"
}

backup_umami() {
  local dump="$work/umami.dump" size
  docker exec umami-db-1 pg_dump -U umami -d umami -Fc > "$dump" || return 1
  docker exec -i umami-db-1 pg_restore --list < "$dump" > /dev/null || return 1
  size="$(stat -c %s "$dump")"
  if [ "$size" -lt 1024 ]; then
    log "the Umami dump is only $size bytes, refusing to upload it" >&2
    return 1
  fi
  upload "$dump" "umami/postgres/umami-$stamp.dump"
}

backup_kuma() {
  local out="$work/kuma"
  mkdir -p "$out"
  sqlite_copy uptime-kuma_data kuma.db "$out" || return 1
  gzip -9 "$out/kuma.db" || return 1
  upload "$out/kuma.db.gz" "uptime-kuma/kuma-$stamp.db.gz"
}

backup_beszel() {
  local out="$work/beszel" image
  mkdir -p "$out"
  sqlite_copy beszel_data data.db "$out" || return 1
  image="$(docker inspect -f '{{.Config.Image}}' uptime-kuma-uptime-kuma-1)" || return 1
  docker run --rm --network none -v beszel_data:/data:ro --entrypoint cat "$image" \
    /data/id_ed25519 > "$out/id_ed25519" || return 1
  chmod 600 "$out/id_ed25519"
  tar -czf "$work/beszel.tar.gz" -C "$out" data.db id_ed25519 || return 1
  upload "$work/beszel.tar.gz" "beszel/beszel-$stamp.tar.gz"
}

for service in umami kuma beszel; do
  log "backing up $service"
  if ! "backup_$service"; then
    log "$service: backup FAILED" >&2
    failed+=("$service")
  fi
done

if [ "${#failed[@]}" -gt 0 ]; then
  log "failed: ${failed[*]}" >&2
  exit 1
fi

log "all backups stored"
if [ -n "${HEARTBEAT_URL:-}" ]; then
  curl --fail --silent --show-error --max-time 10 "$HEARTBEAT_URL" > /dev/null \
    || log "backups stored, but the heartbeat failed" >&2
fi
