#!/bin/bash
#
# An EXAMPLE, for the stock docker-compose stack and nothing else. It is not a
# backup concept, and PLANKA does not ship one: what has to be preserved depends
# on how you run it. On k3s with S3-backed uploads and a managed database
# cluster this script protects nothing — your object store and your database
# have their own answers, and those are the ones that count.
#
# Two things to know before relying on it:
#
#   1. The archive is written in the clear unless you set BACKUP_PASSPHRASE. It
#      contains the whole database: password hashes, active sessions, TOTP
#      secrets and recovery codes, SMTP credentials and any API keys. Treat an
#      unencrypted archive as equivalent to shell access on the instance.
#
#   2. It runs against a live instance, so the database and the uploaded files
#      are captured moments apart. The database goes first on purpose: something
#      created in between leaves a file with no row, which is inert. The other
#      order would leave rows pointing at files that were never copied. Neither
#      order survives a deletion landing in the gap. For a backup with no such
#      window, stop the app for the duration, or use your database's
#      point-in-time recovery together with a volume snapshot.
#
# Usage:
#   ./docker-backup.sh [target-directory]
#   BACKUP_PASSPHRASE='…' ./docker-backup.sh [target-directory]

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
docker run --rm --volumes-from "$DOCKER_CONTAINER_PLANKA" -v "$BACKUP_TEMP:/backup" node:24-alpine cp -r /app/data /backup/data
echo "Success!"
echo

if [ -n "$BACKUP_PASSPHRASE" ]; then
    echo -n "Creating encrypted archive $BACKUP_DATETIME-backup.tgz.enc ... "
    tar -C "$BACKUP_DIR" -czf - "$BACKUP_DATETIME-backup" \
        | openssl enc -aes-256-cbc -pbkdf2 -iter 600000 -salt \
            -pass env:BACKUP_PASSPHRASE -out "$BACKUP_TEMP.tgz.enc"
    echo "Success!"
    echo
    echo "Restore with:"
    echo "  openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \\"
    echo "    -pass env:BACKUP_PASSPHRASE -in $BACKUP_DATETIME-backup.tgz.enc | tar -xzf -"
    echo
else
    echo -n "Creating final tarball $BACKUP_DATETIME-backup.tgz ... "
    tar -C "$BACKUP_DIR" -czf "$BACKUP_TEMP.tgz" "$BACKUP_DATETIME-backup"
    echo "Success!"
    echo
    echo "WARNING: this archive is NOT encrypted. It carries password hashes,"
    echo "         active sessions, TOTP secrets and SMTP credentials in the"
    echo "         clear. Set BACKUP_PASSPHRASE to encrypt it, and store it"
    echo "         where you would store a copy of the database itself."
    echo
fi

echo -n "Cleaning up temporary files and directories ... "
rm -rf "$BACKUP_TEMP"
echo "Success!"
echo

echo "Backup Complete!"
