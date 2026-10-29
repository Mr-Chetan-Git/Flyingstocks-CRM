#!/bin/bash
set -e

echo "Restarting AI CRM containers..."
docker compose restart
echo "✅ AI CRM containers restarted successfully."
