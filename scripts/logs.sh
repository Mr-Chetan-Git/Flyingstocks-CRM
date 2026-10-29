#!/bin/bash
set -e

echo "Displaying live logs for AI CRM containers (Ctrl+C to exit)..."
docker compose logs -f --tail=100
