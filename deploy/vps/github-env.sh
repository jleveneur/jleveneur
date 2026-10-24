#!/usr/bin/env bash
# Sets the production values of the portfolio, the services and the backups in
# GitHub, from a local env file, for the Deploy workflow to write to the
# server: the secrets in the `production` environment's secrets, the rest in
# its variables. Each name carries its service's prefix; the workflow's "Write
# the production variables" step maps it to the file and key it ends up in.
#
#   bash deploy/vps/github-env.sh ~/.config/jleveneur/production.env
#
# Then merge or run the Deploy workflow: nothing reaches the server before.
# GitHub never shows a secret again, so the file stays the copy to keep,
# outside Git. It is parsed, not sourced: `NAME=value` lines, the value
# optionally in matching quotes. An empty value deletes the name in GitHub;
# a name absent from the file is left as it is there; a name the workflow
# does not write is refused rather than set and ignored. Prints no value.
#
# Needs `gh` signed in with admin access to the repository.
set -euo pipefail

file="${1:-}"
if [ ! -r "$file" ]; then
  echo "Usage: bash deploy/vps/github-env.sh /path/to/production.env" >&2
  exit 1
fi

repository=jleveneur/jleveneur
# The names .github/workflows/deploy.yml writes, by where they live.
secrets=" PORTFOLIO_RESEND_API_KEY UMAMI_POSTGRES_PASSWORD UMAMI_APP_SECRET UMAMI_TWO_FACTOR_ENCRYPTION_KEY BESZEL_AGENT_TOKEN R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY BACKUP_HEARTBEAT_URL "
variables=" PORTFOLIO_EMAIL_FROM PORTFOLIO_CONTACT_TO PORTFOLIO_LOG_LEVEL BESZEL_AGENT_KEY R2_ENDPOINT R2_BUCKET "

names=()
values=()
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    "" | "#"*) continue ;;
  esac
  if [[ ! "$line" =~ ^([A-Z][A-Z0-9_]*)=(.*)$ ]]; then
    echo "Not a NAME=value line: ${line%%=*}=…" >&2
    exit 1
  fi
  name="${BASH_REMATCH[1]}"
  value="${BASH_REMATCH[2]}"
  if [[ "$value" =~ ^\"(.*)\"$ || "$value" =~ ^\'(.*)\'$ ]]; then
    value="${BASH_REMATCH[1]}"
  fi
  if [[ "$secrets$variables" != *" $name "* ]]; then
    echo "$name is not one the Deploy workflow writes: add it there first." >&2
    exit 1
  fi
  names+=("$name")
  values+=("$value")
done < "$file"

for i in "${!names[@]}"; do
  name="${names[$i]}"
  value="${values[$i]}"
  if [[ "$secrets" == *" $name "* ]]; then
    kind=secret
  else
    kind=variable
  fi

  if [ -z "$value" ]; then
    gh "$kind" delete "$name" --repo "$repository" --env production > /dev/null 2>&1 || true
    echo "$name: deleted (production $kind)"
  elif [ "$kind" = secret ]; then
    # On stdin, so the value is never an argument another process can list.
    printf '%s' "$value" | gh secret set "$name" --repo "$repository" --env production > /dev/null
    echo "$name: set (production secret)"
  else
    gh variable set "$name" --repo "$repository" --env production --body "$value" > /dev/null
    echo "$name: set (production variable)"
  fi
done
