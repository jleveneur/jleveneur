#!/usr/bin/env bash
# Removes the former per-project deploy accounts, once both repositories have
# deployed as `deploy` (deploy-user.sh).
#
#   sudo bash retire-deploy-users.sh
#
# Refuses while anything on the server still belongs to them, so a project
# missed by deploy-user.sh is not left without an owner.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo." >&2
  exit 1
fi

for user in deploy-hydromag deploy-jleveneur; do
  if ! id "$user" > /dev/null 2>&1; then
    echo "$user: already gone"
    continue
  fi
  home="$(getent passwd "$user" | cut -d: -f6)"
  owned="$(find /srv /etc/caddy /etc/systemd/system -user "$user" -print -quit 2> /dev/null)"
  if [ -n "$owned" ]; then
    echo "$user still owns $owned: run deploy-user.sh first." >&2
    exit 1
  fi
  pkill -u "$user" 2> /dev/null || true
  userdel --remove "$user" 2> /dev/null || userdel "$user"
  rm -f "/etc/sudoers.d/$user"
  [ -d "$home" ] && rm -rf "$home"
  echo "$user: removed"
done

getent group docker
ls /etc/sudoers.d
