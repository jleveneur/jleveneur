#!/usr/bin/env bash
# Gives both repositories that deploy to the VPS the same deploy settings: the
# `deploy` account's private key and the server's pinned host key in their
# `production` environments, and the host in their repository variables.
# A personal GitHub account has no secrets shared between repositories, so the
# one key is set in each; rotating it is running this again.
#
#   bash deploy/vps/github-secrets.sh ~/.ssh/vps_deploy
#
# Needs `gh` signed in with access to both repositories. Prints no secret.
set -euo pipefail

key_file="${1:-}"
if [ ! -r "$key_file" ]; then
  echo "Usage: bash deploy/vps/github-secrets.sh /path/to/private-key" >&2
  exit 1
fi

host=128.140.13.251
# The server's ed25519 host key, checked before it is pinned.
fingerprint=SHA256:oSdM4+zyW56i9IHTvM8fYAIW78WCACu/ntdabhDTSWo
repositories=(jleveneur/hydromag jleveneur/jleveneur)

known_hosts="$(ssh-keyscan -t ed25519 "$host" 2> /dev/null)"
scanned="$(printf '%s\n' "$known_hosts" | ssh-keygen -lf - | awk '{print $2}')"
if [ "$scanned" != "$fingerprint" ]; then
  echo "The host key of $host is $scanned, expected $fingerprint: not pinning it." >&2
  exit 1
fi

for repository in "${repositories[@]}"; do
  gh secret set DEPLOY_SSH_KEY --repo "$repository" --env production < "$key_file"
  printf '%s\n' "$known_hosts" | gh secret set DEPLOY_KNOWN_HOSTS --repo "$repository" --env production
  gh variable set DEPLOY_HOST --repo "$repository" --body "$host"
  # The workflows default to `deploy`; an override would keep the old account.
  gh variable delete DEPLOY_USER --repo "$repository" 2> /dev/null || true
  echo "$repository: deploy key, host key and host set"
done
