#!/bin/bash

# Stop on Error
set -e

# Configure those to match your PLANKA Docker container names
PLANKA_DOCKER_CONTAINER_POSTGRES="planka-postgres-1"
PLANKA_DOCKER_CONTAINER_PLANKA="planka-planka-1"

# Create Temporary folder
if date --version >/dev/null 2>&1; then
    # GNU date (Linux)
    BACKUP_DATETIME=$(date --utc +%FT%H-%M-%SZ)
else
    # BSD date (macOS)
    BACKUP_DATETIME=$(date -u +%FT%H-%M-%SZ)
fi
mkdir -p "$BACKUP_DATETIME-backup"

# Dump DB into SQL File
echo -n "Exporting postgres database ... "
docker exec -t "$PLANKA_DOCKER_CONTAINER_POSTGRES" pg_dumpall -c -U postgres > "$BACKUP_DATETIME-backup/postgres.sql"
echo "Success!"

# Export Docker Volume
echo -n "Exporting data volume ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$BACKUP_DATETIME-backup:/backup" ubuntu cp -r /app/data /backup/data
echo "Success!"

# Create tgz
echo -n "Creating final tarball $BACKUP_DATETIME-backup.tgz ... "
tar -czf "$BACKUP_DATETIME-backup.tgz" \
    "$BACKUP_DATETIME-backup/postgres.sql" \
    "$BACKUP_DATETIME-backup/data"
echo "Success!"

# Remove source files
echo -n "Cleaning up temporary files and folders ... "
rm -rf "$BACKUP_DATETIME-backup"
echo "Success!"

echo "Backup Complete!"
