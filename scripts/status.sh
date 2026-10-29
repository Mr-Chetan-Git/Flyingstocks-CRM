#!/bin/bash
set -e

echo "============================================="
echo "        AI CRM Container Status              "
echo "============================================="
docker compose ps
echo ""
echo "============================================="
echo "        Backend API Health Status            "
echo "============================================="
CRM_PORT=${CRM_PORT:-80}
curl -s http://localhost:"$CRM_PORT"/api/health || echo "Unable to reach health endpoint on port $CRM_PORT"
echo ""
