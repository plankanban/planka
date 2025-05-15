#!/bin/bash

set -eu

# Load secrets from files if *__FILE variables are provided.
# Only the first line of each file is read (newline excluded).

# DATABASE_PASSWORD (used to dynamically inject into DATABASE_URL)
if [[ -n "${DATABASE_URL}" ]]; then
  if [[ -z "${DATABASE_PASSWORD:-}" && -e "${DATABASE_PASSWORD__FILE:-}" ]]; then
    read DATABASE_PASSWORD < "${DATABASE_PASSWORD__FILE}"
    export DATABASE_URL="${DATABASE_URL/\$\{DATABASE_PASSWORD\}/${DATABASE_PASSWORD}}"
  fi
fi

# SECRET_KEY
if [[ -z "${SECRET_KEY:-}" && -e "${SECRET_KEY__FILE:-}" ]]; then
  read SECRET_KEY < "${SECRET_KEY__FILE}"
  export SECRET_KEY
fi

# DEFAULT_ADMIN_PASSWORD
if [[ -z "${DEFAULT_ADMIN_PASSWORD:-}" && -e "${DEFAULT_ADMIN_PASSWORD__FILE:-}" ]]; then
  read DEFAULT_ADMIN_PASSWORD < "${DEFAULT_ADMIN_PASSWORD__FILE}"
  export DEFAULT_ADMIN_PASSWORD
fi

# S3_SECRET_ACCESS_KEY
if [[ -z "${S3_SECRET_ACCESS_KEY:-}" && -e "${S3_SECRET_ACCESS_KEY__FILE:-}" ]]; then
  read S3_SECRET_ACCESS_KEY < "${S3_SECRET_ACCESS_KEY__FILE}"
  export S3_SECRET_ACCESS_KEY
fi

# OIDC_CLIENT_SECRET
if [[ -z "${OIDC_CLIENT_SECRET:-}" && -e "${OIDC_CLIENT_SECRET__FILE:-}" ]]; then
  read OIDC_CLIENT_SECRET < "${OIDC_CLIENT_SECRET__FILE}"
  export OIDC_CLIENT_SECRET
fi

# SMTP_PASSWORD
if [[ -z "${SMTP_PASSWORD:-}" && -e "${SMTP_PASSWORD__FILE:-}" ]]; then
  read SMTP_PASSWORD < "${SMTP_PASSWORD__FILE}"
  export SMTP_PASSWORD
fi

export NODE_ENV=production

node db/init.js
exec node app.js --prod
