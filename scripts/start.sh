#!/bin/bash
set -e

echo "Starting AI CRM containers..."
docker compose up -d
echo "✅ AI CRM containers started successfully."
echo "UI: http://localhost"
