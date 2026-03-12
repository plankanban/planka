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

start_outgoing_proxy_if_needed() {
  # If a custom outgoing proxy is set, do not start internal proxy
  if [[ -n "${OUTGOING_PROXY:-}" ]]; then
    return
  fi

  # Minimum safe defaults
  if [[ -z "${OUTGOING_BLOCKED_HOSTS+x}" ]]; then
    OUTGOING_BLOCKED_HOSTS="localhost,postgres"
  fi

  # If no blocked/allowed rules exist, do not start internal proxy
  if [[ -z "${OUTGOING_BLOCKED_IPS:-}" && -z "${OUTGOING_BLOCKED_HOSTS:-}" && -z "${OUTGOING_ALLOWED_IPS:-}" && -z "${OUTGOING_ALLOWED_HOSTS:-}" ]]; then
    return
  fi

  SQUID_CONF="/tmp/squid.conf"
  SQUID_PID="/tmp/squid.pid"

  : > "$SQUID_CONF"

  # Basic settings
  echo "pid_filename $SQUID_PID" >> "$SQUID_CONF"
  echo "http_port 127.0.0.1:3128" >> "$SQUID_CONF"
  echo "acl all src all" >> "$SQUID_CONF"

  # Disable caching
  echo "cache deny all" >> "$SQUID_CONF"
  echo "cache_mem 0" >> "$SQUID_CONF"
  echo "memory_pools off" >> "$SQUID_CONF"
  echo "cache_swap_low 0" >> "$SQUID_CONF"
  echo "cache_swap_high 0" >> "$SQUID_CONF"

  # Disable logs
  echo "access_log none" >> "$SQUID_CONF"
  echo "cache_store_log none" >> "$SQUID_CONF"
  echo "cache_log /dev/null" >> "$SQUID_CONF"
  echo "logfile_rotate 0" >> "$SQUID_CONF"
  echo "debug_options ALL,0" >> "$SQUID_CONF"

  # Make it pass-through like
  echo "forwarded_for delete" >> "$SQUID_CONF"
  echo "via off" >> "$SQUID_CONF"
  echo "request_header_access X-Forwarded-For deny all" >> "$SQUID_CONF"
  echo "request_header_access Via deny all" >> "$SQUID_CONF"
  echo "request_header_access Cache-Control deny all" >> "$SQUID_CONF"

  # Allow only local sources
  echo "acl localhost_src src 127.0.0.1" >> "$SQUID_CONF"
  echo "http_access deny !localhost_src" >> "$SQUID_CONF"

  # Blocked IPs
  if [[ -n "${OUTGOING_BLOCKED_IPS:-}" ]]; then
    IFS=',' read -ra BLOCKED_IPS <<< "$OUTGOING_BLOCKED_IPS"
    for ip in "${BLOCKED_IPS[@]}"; do
      echo "acl blocked_ip dst $ip" >> "$SQUID_CONF"
    done
    echo "http_access deny blocked_ip" >> "$SQUID_CONF"
  fi

  # Blocked hostnames
  if [[ -n "${OUTGOING_BLOCKED_HOSTS:-}" ]]; then
    IFS=',' read -ra BLOCKED_HOSTS <<< "$OUTGOING_BLOCKED_HOSTS"
    for host in "${BLOCKED_HOSTS[@]}"; do
      echo "acl blocked_host dstdomain $host" >> "$SQUID_CONF"
    done
    echo "http_access deny blocked_host" >> "$SQUID_CONF"
  fi

  # Allowed IPs
  if [[ -n "${OUTGOING_ALLOWED_IPS:-}" ]]; then
    IFS=',' read -ra ALLOWED_IPS <<< "$OUTGOING_ALLOWED_IPS"
    for ip in "${ALLOWED_IPS[@]}"; do
      echo "acl allowed_ip dst $ip" >> "$SQUID_CONF"
    done
    echo "http_access allow allowed_ip" >> "$SQUID_CONF"
  fi

  # Allowed hostnames
  if [[ -n "${OUTGOING_ALLOWED_HOSTS:-}" ]]; then
    IFS=',' read -ra ALLOWED_HOSTS <<< "$OUTGOING_ALLOWED_HOSTS"
    for host in "${ALLOWED_HOSTS[@]}"; do
      echo "acl allowed_host dstdomain $host" >> "$SQUID_CONF"
    done
    echo "http_access allow allowed_host" >> "$SQUID_CONF"
  fi

  # If any allowed rules exist, everything else is denied
  if [[ -n "${OUTGOING_ALLOWED_IPS+x}${OUTGOING_ALLOWED_HOSTS+x}" ]]; then
    echo "http_access deny all" >> "$SQUID_CONF"
  else
    # If no allowed rules exist, everything else is allowed
    echo "http_access allow all" >> "$SQUID_CONF"
  fi

  # Start Squid
  rm -f "$SQUID_PID"
  squid -N -f "$SQUID_CONF" &

  # Set environment variable
  export OUTGOING_PROXY="http://127.0.0.1:3128"
}

if [[ -n "${DATABASE_URL:-}" ]]; then
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

start_outgoing_proxy_if_needed

export NODE_ENV=production

node db/init.js
exec node app.js --prod
