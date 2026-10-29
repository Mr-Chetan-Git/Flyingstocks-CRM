#!/bin/bash
set -e

echo "Stopping AI CRM containers (preserving database data)..."
docker compose down
echo "✅ AI CRM containers stopped. Database data preserved in postgres_data volume."
