#!/bin/bash

# Stop on Error
set -e

# Configure those to match your PLANKA Docker container names
PLANKA_DOCKER_CONTAINER_POSTGRES="planka-postgres-1"
PLANKA_DOCKER_CONTAINER_PLANKA="planka-planka-1"

# Create Temporary folder
BACKUP_DATETIME=$(date --utc +%FT%H-%M-%SZ)
mkdir -p "$BACKUP_DATETIME-backup"

# Dump DB into SQL File
echo -n "Exporting postgres database ... "
docker exec -t "$PLANKA_DOCKER_CONTAINER_POSTGRES" pg_dumpall -c -U postgres > "$BACKUP_DATETIME-backup/postgres.sql"
echo "Success!"

# Export Docker Voumes
echo -n "Exporting favicons ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$BACKUP_DATETIME-backup:/backup" ubuntu cp -r /app/public/favicons /backup/favicons
echo "Success!"
echo -n "Exporting user-avatars ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$BACKUP_DATETIME-backup:/backup" ubuntu cp -r /app/public/user-avatars /backup/user-avatars
echo "Success!"
echo -n "Exporting background-images ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$BACKUP_DATETIME-backup:/backup" ubuntu cp -r /app/public/background-images /backup/background-images
echo "Success!"
echo -n "Exporting attachments ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$BACKUP_DATETIME-backup:/backup" ubuntu cp -r /app/private/attachments /backup/attachments
echo "Success!"

# Create tgz
echo -n "Creating final tarball $BACKUP_DATETIME-backup.tgz ... "
tar -czf "$BACKUP_DATETIME-backup.tgz" \
    "$BACKUP_DATETIME-backup/postgres.sql" \
    "$BACKUP_DATETIME-backup/favicons" \
    "$BACKUP_DATETIME-backup/user-avatars" \
    "$BACKUP_DATETIME-backup/background-images" \
    "$BACKUP_DATETIME-backup/attachments"
echo "Success!"

# Remove source files
echo -n "Cleaning up temporary files and folders ... "
rm -rf "$BACKUP_DATETIME-backup"
echo "Success!"

echo "Backup Complete!"
