#!/bin/bash
set -e

# Load environment variables
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

DB_NAME=${POSTGRES_DB:-crm_db}
DB_USER=${POSTGRES_USER:-crm_user}
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
BACKUP_FILE="${BACKUP_DIR}/crm_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "Creating PostgreSQL database backup for '${DB_NAME}'..."

docker exec -t crm_postgres pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"

echo "✅ Backup created successfully: ${BACKUP_FILE}"
ls -lh "$BACKUP_FILE"
