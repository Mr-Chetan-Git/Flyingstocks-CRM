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

if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR/*.sql 2>/dev/null)" ]; then
    echo "❌ Error: No backup files (.sql) found in directory '${BACKUP_DIR}'."
    exit 1
fi

echo "============================================="
echo "        Available Database Backups           "
echo "============================================="
select BACKUP_FILE in "$BACKUP_DIR"/*.sql; do
    if [ -n "$BACKUP_FILE" ]; then
        echo "Selected backup: $BACKUP_FILE"
        break
    else
        echo "Invalid selection."
    fi
done

echo ""
echo "⚠️ WARNING: Restoring will overwrite the current database contents!"
read -rp "Type 'RESTORE' to confirm operation: " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo "1. Stopping backend container to prevent concurrent database writes..."
docker compose stop backend

echo "2. Restoring PostgreSQL database from $BACKUP_FILE..."
docker exec -i crm_postgres psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"

echo "3. Restarting backend container..."
docker compose start backend

echo "4. Verifying application health..."
CRM_PORT=${CRM_PORT:-80}
sleep 3
curl -s http://localhost:"$CRM_PORT"/api/health || echo "Notice: Backend is starting up."

echo "✅ Database restore completed successfully."
