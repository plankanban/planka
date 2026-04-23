#!/bin/bash

# Stop on error
set -e

# Configure those to match your Docker container names
DOCKER_CONTAINER_POSTGRES="planka-postgres-1"
DOCKER_CONTAINER_PLANKA="planka-planka-1"

# Use provided directory or default to current directory
BACKUP_DIR="${1:-$(pwd)}"

if [ -z "$1" ]; then
    echo "No backup directory specified, backing up to current directory: $BACKUP_DIR"
else
    echo "Backing up to: $BACKUP_DIR"
fi
echo

if date --version >/dev/null 2>&1; then
    # GNU date (Linux)
    BACKUP_DATETIME=$(date --utc +%FT%H-%M-%SZ)
else
    # BSD date (macOS)
    BACKUP_DATETIME=$(date -u +%FT%H-%M-%SZ)
fi

BACKUP_TEMP="$BACKUP_DIR/$BACKUP_DATETIME-backup"

# Create temporary directory
mkdir -p "$BACKUP_TEMP"

echo -n "Exporting postgres database ... "
docker exec -t "$DOCKER_CONTAINER_POSTGRES" pg_dumpall -c -U postgres > "$BACKUP_TEMP/postgres.sql"
echo "Success!"
echo

echo -n "Exporting data volume ... "
docker run --rm --volumes-from "$DOCKER_CONTAINER_PLANKA" -v "$BACKUP_TEMP:/backup" node:22-alpine cp -r /app/data /backup/data
echo "Success!"
echo

echo -n "Creating final tarball $BACKUP_DATETIME-backup.tgz ... "
tar -C "$BACKUP_DIR" -czf "$BACKUP_TEMP.tgz" "$BACKUP_DATETIME-backup"
echo "Success!"
echo

echo -n "Cleaning up temporary files and directories ... "
rm -rf "$BACKUP_TEMP"
echo "Success!"
echo

echo "Backup Complete!"
