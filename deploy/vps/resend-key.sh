#!/usr/bin/env bash
# Stores the portfolio's Resend key and its sender in /srv/jleveneur/.env,
# checks the key with Resend, and can send a test message.
#
#   sudo bash resend-key.sh
#
# From a checkout, in a real terminal (sudo and the prompts need one, so the
# script is copied first rather than piped into ssh):
#
#   scp deploy/vps/resend-key.sh julien@<server>:/tmp/ &&
#     ssh -t julien@<server> 'sudo bash /tmp/resend-key.sh; rm -f /tmp/resend-key.sh'
#
# Asks for the API key (nothing is echoed), the sender (on a domain verified
# in Resend) and the address messages go to. A "Sending access" key limited to
# jleveneur.com is enough and is the one to create. The key reaches Resend
# through curl's standard input, never its command line, so `ps` does not show
# it. Other lines of the file (LOG_LEVEL…) are kept. The file belongs to
# `deploy`, mode 600. Rotating the key is running this again.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo." >&2
  exit 1
fi

user=deploy
dir=/srv/jleveneur
file="$dir/.env"
api=https://api.resend.com

# The prompts read the terminal itself, whatever standard input is.
read -rsp "Resend API key: " key < /dev/tty
echo
read -rp "Sender [contact@jleveneur.com]: " from < /dev/tty
read -rp "Messages go to [jleveneur.pro@gmail.com]: " to < /dev/tty
from=${from:-contact@jleveneur.com}
to=${to:-jleveneur.pro@gmail.com}

if ! printf '%s' "$key" | grep -Eq '^re_[A-Za-z0-9_]{20,}$'; then
  echo "Expected a Resend key: re_ followed by letters, digits and underscores." >&2
  exit 1
fi
for address in "$from" "$to"; do
  if ! printf '%s' "$address" | grep -Eq '^[^@[:space:]"]+@[^@[:space:]"]+\.[a-z]{2,}$'; then
    echo "'$address' is not an email address." >&2
    exit 1
  fi
done

# Calls Resend with the key as a curl config line on standard input.
resend() {
  local method="$1" path="$2" body="${3:-}"
  local args=(-sS --config - -X "$method" -H "Content-Type: application/json" -w '\n%{http_code}')
  if [ -n "$body" ]; then
    args+=(--data "$body")
  fi
  printf 'header = "Authorization: Bearer %s"\n' "$key" | curl "${args[@]}" "$api$path"
}

# A full-access key may list the domains; a sending key is refused with
# `restricted_api_key`, which still proves it is a real key.
echo "== key"
response=$(resend GET /domains)
code=${response##*$'\n'}
body=${response%$'\n'*}
domain=${from#*@}
case "$code" in
  200)
    echo "valid, full access"
    if printf '%s' "$body" | grep -q "\"name\":\"$domain\"[^}]*\"status\":\"verified\""; then
      echo "$domain: verified"
    else
      echo "Warning: $domain is not verified in Resend; sending from $from will fail." >&2
    fi
    ;;
  400 | 401 | 403)
    if printf '%s' "$body" | grep -q restricted_api_key; then
      echo "valid, sending access only"
    else
      echo "Resend refused the key (HTTP $code): $body" >&2
      exit 1
    fi
    ;;
  *)
    echo "Unexpected answer from Resend (HTTP $code): $body" >&2
    exit 1
    ;;
esac

# Created only when missing: the directory's mode is not this script's to
# change (Caddy has to traverse it to serve the static releases).
if [ ! -d "$dir" ]; then
  install -d -m 755 -o "$user" -g "$user" "$dir"
fi
umask 077
{
  echo "# The portfolio's environment (deploy/portfolio/compose.yml). The Resend"
  echo "# lines are written by deploy/vps/resend-key.sh. Never in Git."
  echo "RESEND_API_KEY=$key"
  echo "EMAIL_FROM=$from"
  echo "CONTACT_TO=$to"
  if [ -f "$file" ]; then
    grep -Ev '^(#|RESEND_API_KEY=|EMAIL_FROM=|CONTACT_TO=)' "$file" || true
  fi
} > "$file.new"
chown "$user:$user" "$file.new"
chmod 600 "$file.new"
mv "$file.new" "$file"
stat -c '%U %a %n' "$file"

read -rp "Send a test message to $to? [y/N] " test < /dev/tty
if [ "$test" = y ] || [ "$test" = Y ]; then
  echo "== test"
  response=$(resend POST /emails "{\"from\":\"jleveneur.com <$from>\",\"to\":\"$to\",\"subject\":\"[jleveneur.com] Resend test\",\"text\":\"Sent by deploy/vps/resend-key.sh from $(hostname) at $(date -u +%FT%TZ).\"}")
  code=${response##*$'\n'}
  if [ "$code" = 200 ]; then
    echo "sent: check $to"
  else
    echo "Resend refused the message (HTTP $code): ${response%$'\n'*}" >&2
    exit 1
  fi
fi

# A container reads its environment when it is created: recreate the running
# portfolio so it takes the new key. Before the first deploy there is none.
if [ -f "$dir/release.env" ] && [ -f "$dir/compose.yml" ]; then
  echo "== portfolio"
  sudo -u "$user" docker compose --project-directory "$dir" -f "$dir/compose.yml" \
    --env-file "$file" --env-file "$dir/release.env" up -d --wait --wait-timeout 120
else
  echo "The first deploy will start the portfolio with this key."
fi
