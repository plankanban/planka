#!/usr/bin/env bash

# TODO: add warning before copying files to production

set -euo pipefail
IFS=$'\n\t'

if [[ $EUID -eq 0 ]]; then
  echo "[Build] This script should not be run as root. Please run as a regular user."
  exit 1
fi

ROOT_DIR="$(pwd)"
cd "$ROOT_DIR"

check_server_status() {
  if systemctl is-active --quiet "$1"; then
    echo 1
  else
    echo 0
  fi
}

copy_server_to() {
  cp -r server/dist/. "$1"
}



# Build the project in current directory
build() {
  echo "[Build] Starting build at $(date)"

  echo "[Build] Node: $(node -v 2>/dev/null || echo 'not found')"
  echo "[Build] npm: $(npm -v 2>/dev/null || echo 'not found')"


  echo "[Build] Installing server dependencies..."
  npm --prefix server install --omit=prod --ignore-scripts

  echo "[Build] Building server..."
  npm --prefix server run build

  echo "[Build] Installing client dependencies..."
  npm --prefix client install --omit=dev

  echo "[Build] Building client..."
  INDEX_FORMAT=ejs DISABLE_ESLINT_PLUGIN=true npm --prefix client run build

  echo "[Build] Including licenses into server/dist..."
  mkdir -p server/dist
  cp -v LICENSE.md server/dist/ 2>/dev/null || echo "LICENSE.md not found, skipping"
  if [ -f "LICENSES/PLANKA Community License DE.md" ]; then
    cp -v "LICENSES/PLANKA Community License DE.md" server/dist/LICENSE_DE.md
  fi

  echo "[Build] Including built client into server/dist..."
  mkdir -p server/dist/public server/dist/views
  cp -r client/dist/* server/dist/public/
  mv server/dist/public/index.ejs server/dist/views/

  echo "[Build] Finished at $(date)"
}

# Copy server files to development directory /var/www/plankadev/
copy_server_to_dev() {
  echo "[Build] Copying server to /var/www/plankadev/"
  if [[ $(check_server_status plankadev) -eq 1 ]]; then
    sudo systemctl stop plankadev
    copy_server_to /var/www/plankadev/
    sudo systemctl start plankadev
  else
    copy_server_to /var/www/plankadev/
  fi
}

# Copy server files to production directory /var/www/planka/
copy_server_to_prod() {
  echo "[Build] Copying server to /var/www/planka/"
  if [[ $(check_server_status planka) -eq 1 ]]; then
    sudo systemctl stop planka
    copy_server_to /var/www/planka/
    sudo systemctl start planka
  else
    copy_server_to /var/www/planka/
  fi
}

if [[ $# -eq 0 ]]; then
  echo "[Build] No arguments provided. Use -h or --help for usage information."
  exit 0
fi

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "[Build] Available options:"
      echo "[Build]   -h|--help             Show this help message"
      echo "[Build]   -S|--superuser        Run copy operations with sudo to auto stop and start server"
      echo "[Build]   -b|--build            Build the project"
      echo "[Build]   -c|--copy [dev|prod]  Copy build to development or production folder"
      exit 0
      ;;
    -b|--build)
      build
      shift
      ;;
    -c|--copy)
      shift
      if [[ $# -eq 0 ]]; then
        echo "[Build] No target specified for -c|--copy. Use 'dev' or 'prod'."
        exit 1
      fi
      case $1 in
        dev)
          copy_server_to_dev
          shift
          ;;
        prod)
          copy_server_to_prod
          shift
          ;;
        *)
          echo "[Build] Unknown parameter for -c|--copy: $1"
          exit 1
          ;;
      esac
      ;;
    *)
      echo "[Build] Unknown argument: $1"
      exit 1
      ;;
  esac
done
