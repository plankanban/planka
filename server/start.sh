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

# The image is built for uid 1000 and the app creates these directories on first
# start. Under any other uid that fails deep inside the logger, long after an
# operator can tell what went wrong, so name the path here instead.
ensure_runtime_directories() {
  local directories=(.tmp)
  local directory

  # Only needed while the log file sits at its default path: LOG_FILE moves it
  # elsewhere, and then where it lands is the operator's to get right
  if [[ -z "${LOG_FILE:-}" ]]; then
    directories+=(logs)
  fi

  for directory in "${directories[@]}"; do
    if ! mkdir -p "$directory" 2>/dev/null || [[ ! -w "$directory" ]]; then
      echo "PLANKA cannot write to /app/${directory} as uid $(id -u), gid $(id -g)." >&2
      echo "Run the container as uid 1000, as any uid with group 0 (for example user: \"5000:0\"), or mount a writable volume at /app/${directory}." >&2
      exit 1
    fi
  done

  # A volume keeps the ownership it was created with, so this one is the
  # operator's to fix and not worth refusing to start over
  if [[ ! -w data ]]; then
    echo "Warning: PLANKA cannot write to /app/data as uid $(id -u), gid $(id -g). Avatars, attachments and background images will fail to save." >&2
    echo "Change the owner of the volume mounted there to the uid the container runs as, or give that uid group 0." >&2
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
  echo "max_filedescriptors 4096" >> "$SQUID_CONF"
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

# Every variable documented as accepting a __FILE counterpart, so that the
# convention does not quietly do nothing for one of them. DATABASE_PASSWORD is
# only exported: the ${DATABASE_PASSWORD} placeholder in DATABASE_URL is expanded
# by the server, which is the only way the `db:` scripts see the same value.
load_secret DATABASE_URL
load_secret DATABASE_PASSWORD
load_secret SECRET_KEY
load_secret DEFAULT_ADMIN_PASSWORD
load_secret S3_SECRET_ACCESS_KEY
load_secret SMTP_PASSWORD

ensure_runtime_directories

start_outgoing_proxy_if_needed

export NODE_ENV=production

node db/init.js
exec node app.js --prod
