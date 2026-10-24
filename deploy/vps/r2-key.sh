#!/usr/bin/env bash
# Stores the R2 key the VPS's nightly backups use, in /srv/backup/r2.env, then
# checks it can write to and read from the bucket.
#
#   sudo bash r2-key.sh
#
# Asks for the Access Key ID and the Secret Access Key of the `vps-backup`
# token (Object Read & Write on jleveneur-backups only, limited to the VPS's
# addresses). Nothing is echoed. The file belongs to `deploy`, mode 600.
# Rotating the token is running this again.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo." >&2
  exit 1
fi

user=deploy
dir=/srv/backup
file="$dir/r2.env"
endpoint=https://c26c5b583949669dff30359809129641.eu.r2.cloudflarestorage.com
bucket=jleveneur-backups

read -rp "R2 Access Key ID: " key_id
read -rsp "R2 Secret Access Key: " secret
echo
if ! printf '%s' "$key_id" | grep -Eq '^[0-9a-f]{32}$' || ! printf '%s' "$secret" | grep -Eq '^[0-9a-f]{64}$'; then
  echo "Expected a 32-character Access Key ID and a 64-character Secret, both hexadecimal." >&2
  exit 1
fi

install -d -m 750 -o "$user" -g "$user" "$dir"
umask 077
cat > "$file.new" << EOF
# The VPS's backup bucket on Cloudflare R2 (EU jurisdiction), written by
# deploy/vps/r2-key.sh. Never in Git.
R2_ACCESS_KEY_ID=$key_id
R2_SECRET_ACCESS_KEY=$secret
R2_ENDPOINT=$endpoint
R2_BUCKET=$bucket
EOF
chown "$user:$user" "$file.new"
chmod 600 "$file.new"
mv "$file.new" "$file"

# A small object under healthcheck/: written, then read back, as `deploy`. The
# bucket lock keeps it 30 days and the lifecycle rule removes it at 90.
echo "== test"
sudo -u "$user" bash -c '
  set -euo pipefail
  set -a; . "$1"; set +a
  url="$R2_ENDPOINT/$R2_BUCKET/healthcheck/r2-key.txt"
  body="written by r2-key.sh on $(hostname) at $(date -u +%FT%TZ)"
  put=$(curl -s -o /dev/null -w "%{http_code}" --aws-sigv4 "aws:amz:auto:s3" \
    --user "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" -X PUT --data-binary "$body" "$url")
  got=$(curl -s --aws-sigv4 "aws:amz:auto:s3" --user "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" "$url")
  echo "write: HTTP $put"
  [ "$got" = "$body" ] && echo "read back: identical" || echo "read back: DIFFERENT"
' _ "$file"
stat -c '%U %a %n' "$dir" "$file"
