#!/bin/bash

set -eu

# Load secrets from files if corresponding *__FILE environment variables are set.
# Only the first line of each file is read (stripping carriage returns and newlines).

read_secret() {
  local file="$1"
  head -n 1 "$file" | tr -d '\r\n'
}

load_secret() {
  local envar="$1"
  local file="${envar}__FILE"
  if [[ -z "${!envar:-}" && -e "${!file:-}" ]]; then
    export "$envar"="$(read_secret "${!file}")"
  fi
}

if [[ -n "${DATABASE_URL}" ]]; then
  if [[ -z "${DATABASE_PASSWORD:-}" && -e "${DATABASE_PASSWORD__FILE:-}" ]]; then
    DATABASE_PASSWORD="$(read_secret "${DATABASE_PASSWORD__FILE}")"
    export DATABASE_URL="${DATABASE_URL/\$\{DATABASE_PASSWORD\}/${DATABASE_PASSWORD}}"
  fi
fi

load_secret SECRET_KEY
load_secret DEFAULT_ADMIN_PASSWORD
load_secret S3_SECRET_ACCESS_KEY
load_secret OIDC_CLIENT_SECRET
load_secret SMTP_PASSWORD

export NODE_ENV=production

node db/init.js
exec node app.js --prod
