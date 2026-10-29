#!/bin/sh
set -e

echo "============================================="
echo "   Starting CRM Backend Container (Gunicorn)  "
echo "============================================="

# Wait for PostgreSQL container to become ready
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}

echo "Waiting for PostgreSQL database at ${DB_HOST}:${DB_PORT}..."
until nc -z "${DB_HOST}" "${DB_PORT}"; do
  echo "PostgreSQL is unavailable - sleeping 2 seconds..."
  sleep 2
done

echo "✅ PostgreSQL database connection established."

# Construct DATABASE_URL if not explicitly set
if [ -z "${DATABASE_URL}" ] && [ -n "${POSTGRES_USER}" ] && [ -n "${POSTGRES_PASSWORD}" ] && [ -n "${POSTGRES_DB}" ]; then
    export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DB_HOST}:${DB_PORT}/${POSTGRES_DB}"
fi

# Launch production Gunicorn WSGI server (1 worker, 4 threads to conserve PyTorch RAM)
echo "Starting Gunicorn WSGI server on 0.0.0.0:5000..."
exec gunicorn --bind 0.0.0.0:5000 --workers 1 --threads 4 --timeout 120 app:app
