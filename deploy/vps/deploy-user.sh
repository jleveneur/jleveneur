#!/usr/bin/env bash
# Sets up `deploy`, the one account both repositories' Deploy workflows use on
# the VPS, and hands it everything they deploy.
#
#   sudo bash deploy-user.sh /path/to/deploy-key.pub
#
# - `deploy` joins the docker group (root-equivalent, which is why its private
#   key lives only in the repositories' `production` environments);
# - its SSH key is `restrict`ed: commands, no forwarding, no agent, no pty;
# - sudo grants it two commands and nothing else: reloading Caddy, and starting
#   the Hydromag backup by hand;
# - it owns the project directories in /srv and their sites files in
#   /etc/caddy/sites (not the directories), and the Hydromag backup runs as it.
#
# The former per-project accounts stay until both workflows have deployed as
# `deploy`; retire-deploy-users.sh removes them. Running containers are not
# touched. Idempotent.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo." >&2
  exit 1
fi

key_file="${1:-}"
if [ ! -r "$key_file" ]; then
  echo "Usage: sudo bash deploy-user.sh /path/to/deploy-key.pub" >&2
  exit 1
fi
key="$(head -n 1 "$key_file")"
case "$key" in
  ssh-ed25519\ *) ;;
  *)
    echo "Expected an ssh-ed25519 public key in $key_file." >&2
    exit 1
    ;;
esac

user=deploy
projects=(hydromag jleveneur uptime-kuma beszel umami)

if ! id "$user" > /dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "$user"
fi
usermod -aG docker "$user"

home="$(getent passwd "$user" | cut -d: -f6)"
install -d -m 700 -o "$user" -g "$user" "$home/.ssh"
printf 'restrict %s\n' "$key" > "$home/.ssh/authorized_keys"
chown "$user:$user" "$home/.ssh/authorized_keys"
chmod 600 "$home/.ssh/authorized_keys"

sudoers=/etc/sudoers.d/deploy
printf '%s ALL=(root) NOPASSWD: /usr/bin/systemctl reload caddy, /usr/bin/systemctl start hydromag-backup.service\n' \
  "$user" > "$sudoers.new"
chmod 440 "$sudoers.new"
visudo -cf "$sudoers.new" > /dev/null
mv "$sudoers.new" "$sudoers"

for project in "${projects[@]}"; do
  if [ -d "/srv/$project" ]; then
    chown -R "$user:$user" "/srv/$project"
  fi
  if [ -f "/etc/caddy/sites/$project.caddy" ]; then
    chown "$user:$user" "/etc/caddy/sites/$project.caddy"
  fi
done

unit=/etc/systemd/system/hydromag-backup.service
if [ -f "$unit" ]; then
  sed -i -E "s/^User=.*/User=$user/; s/^Group=.*/Group=$user/" "$unit"
  systemctl daemon-reload
fi

echo "== checks"
id "$user"
sudo -l -U "$user" | tail -n 2
sudo -u "$user" docker ps --format '{{.Names}}' | sort | tr '\n' ' '
echo
for project in "${projects[@]}"; do
  stat -c '%U %n' "/srv/$project"
done
stat -c '%U %n' /etc/caddy/sites/*.caddy
grep -E '^(User|Group)=' "$unit"
