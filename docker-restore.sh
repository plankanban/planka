#!/bin/bash

# Stop on error
set -e

# Configure those to match your Docker container names
DOCKER_CONTAINER_POSTGRES="planka-postgres-1"
DOCKER_CONTAINER_PLANKA="planka-planka-1"

# Use provided archive
BACKUP_ARCHIVE="$1"

if [ -z "$BACKUP_ARCHIVE" ]; then
    echo "Usage: $0 <backup-archive.tgz>"
    exit 1
fi

BACKUP_DIR=$(dirname "$BACKUP_ARCHIVE")
BACKUP_TEMP="$BACKUP_DIR/$(basename "$BACKUP_ARCHIVE" .tgz)"

echo -n "Extracting tarball $BACKUP_ARCHIVE ... "
tar -C "$BACKUP_DIR" -xzf "$BACKUP_ARCHIVE"
echo "Success!"
echo

echo -n "Importing postgres database ... "
cat "$BACKUP_TEMP/postgres.sql" | docker exec -i "$DOCKER_CONTAINER_POSTGRES" psql -U postgres
echo "Success!"
echo

echo -n "Importing data volume ... "
docker run --rm --user root --volumes-from "$DOCKER_CONTAINER_PLANKA" -v "$BACKUP_TEMP:/backup" node:22-alpine sh -c "cp -rf /backup/data/. /app/data && chown -R node:node /app/data/*"
echo "Success!"
echo

echo -n "Cleaning up temporary files and directories ... "
rm -r "$BACKUP_TEMP"
echo "Success!"
echo

echo "Restore complete!"
