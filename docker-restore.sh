#!/bin/bash

# Stop on Error
set -e

# Configure those to match your Planka Docker container names
PLANKA_DOCKER_CONTAINER_POSTGRES="planka_postgres_1"
PLANKA_DOCKER_CONTAINER_PLANKA="planka_planka_1"

# Extract tgz archive
PLANKA_BACKUP_ARCHIVE_TGZ=$1
PLANKA_BACKUP_ARCHIVE=$(basename "$PLANKA_BACKUP_ARCHIVE_TGZ" .tgz)
echo -n "Extracting tarball $PLANKA_BACKUP_ARCHIVE_TGZ ... "
tar -xzf "$PLANKA_BACKUP_ARCHIVE_TGZ"
echo "Success!"

# Import Database
echo -n "Importing postgres database ... "
cat "$PLANKA_BACKUP_ARCHIVE/postgres.sql" | docker exec -i "$PLANKA_DOCKER_CONTAINER_POSTGRES" psql -U postgres
echo "Success!"

# Restore Docker Volumes
echo -n "Importing user-avatars ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$PLANKA_BACKUP_ARCHIVE:/backup" ubuntu cp -rf /backup/user-avatars /app/public/
echo "Success!"
echo -n "Importing project-background-images ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$PLANKA_BACKUP_ARCHIVE:/backup" ubuntu cp -rf /backup/project-background-images /app/public/
echo "Success!"
echo -n "Importing attachments ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$PLANKA_BACKUP_ARCHIVE:/backup" ubuntu cp -rf /backup/attachments /app/private/
echo "Success!"

echo -n "Cleaning up temporary files and folders ... "
rm -r "$PLANKA_BACKUP_ARCHIVE"
echo "Success!"

echo "Restore complete!"
