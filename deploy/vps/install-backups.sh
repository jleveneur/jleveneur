#!/usr/bin/env bash
# Installs or updates the VPS's backup units, and starts their timers.
#
#   sudo bash install-backups.sh <unit files…>
#
# The units come from the repositories: deploy/backup/jleveneur-backup.*
# here, deploy/backup/hydromag-backup.* in jleveneur/hydromag. The scripts they
# run are kept current by each repository's deploy workflow; only the units
# need root, once, and again when one changes.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo." >&2
  exit 1
fi
if [ "$#" -eq 0 ]; then
  echo "Usage: sudo bash install-backups.sh <unit files…>" >&2
  exit 1
fi

timers=()
for unit in "$@"; do
  name="$(basename "$unit")"
  case "$name" in
    *-backup.service | *-backup.timer) ;;
    *)
      echo "$name is not a backup unit." >&2
      exit 1
      ;;
  esac
  systemd-analyze verify "$unit" 2> /dev/null || true
  install -m 644 -o root -g root "$unit" "/etc/systemd/system/$name"
  [[ "$name" == *.timer ]] && timers+=("$name")
done
systemctl daemon-reload
for timer in "${timers[@]}"; do
  systemctl enable --now "$timer"
done
systemctl list-timers --all --no-pager '*-backup.timer'
