#!/bin/bash

set -eu

# Load secrets from files if needed. Only the first line, not including the \n,
# is loaded.
if [[ -z "${SECRET_KEY:-}" && -e "${SECRET_KEY__FILE:-}" ]]; then
  read SECRET_KEY <"${SECRET_KEY__FILE}"
  export SECRET_KEY
fi
if [[ -z "${SMTP_PASSWORD:-}" && -e "${SMTP_PASSWORD__FILE:-}" ]]; then
  read SMTP_PASSWORD <"${SMTP_PASSWORD__FILE}"
  export SMTP_PASSWORD
fi
if [[ -z "${DATABASE_PASSWORD:-}" && -e "${DATABASE_PASSWORD__FILE:-}" ]]; then
  read DATABASE_PASSWORD <"${DATABASE_PASSWORD__FILE}"
  # No need to export DATABASE_PASSWORD, it is only used below.
fi
# Replace the exact "${DATABASE_PASSWORD}" string in the DATABASE_URL
# environment variable with the contents of DATABASE_PASSWORD.
if [[ -n "${DATABASE_PASSWORD:-}" && -n "${DATABASE_URL}" ]]; then
  export DATABASE_URL="${DATABASE_URL/\$\{DATABASE_PASSWORD\}/${DATABASE_PASSWORD}}"
fi

export NODE_ENV=production

node db/init.js
exec node app.js --prod
