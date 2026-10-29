#!/usr/bin/env bash
set -e

echo "========================================"
echo "        AI CRM INSTALLATION"
echo "========================================"
echo ""

# 1. Prerequisite Checks
if [ ! -f "docker-compose.yml" ]; then
    echo "[ERROR] docker-compose.yml not found in the current directory."
    echo "Please execute install.sh from the root CRM directory."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed."
    echo "Please install Docker Desktop and run this installer again."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "[ERROR] Docker daemon is not running."
    echo "Please start Docker Desktop and run this installer again."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "[ERROR] Docker Compose is not available."
    echo "Please install Docker Compose v2 and run this installer again."
    exit 1
fi

echo "Prerequisites   ✓ Verified"
echo ""

# 2. Interactive Configuration & .env Handling
RECONFIGURE=0

if [ -f ".env" ]; then
    echo "An existing .env file was found."
    echo ""
    echo "1. Keep existing configuration"
    echo "2. Reconfigure interactively"
    echo "3. Cancel"
    echo ""
    read -rp "Select an option [1-3]: " ENV_CHOICE
    case "$ENV_CHOICE" in
        1)
            echo "  - Keeping existing configuration."
            RECONFIGURE=0
            ;;
        2)
            cp .env .env.backup
            echo "  - Backup created: .env.backup"
            RECONFIGURE=1
            ;;
        3|*)
            echo "Installation cancelled."
            exit 0
            ;;
    esac
else
    RECONFIGURE=1
fi

if [ "$RECONFIGURE" -eq 1 ]; then
    echo ""
    echo "DATABASE CONFIGURATION"
    echo "----------------------------------------"
    read -rp "PostgreSQL database name [crm_db]: " IN_DB_NAME
    POSTGRES_DB="${IN_DB_NAME:-crm_db}"

    read -rp "PostgreSQL username [crm_user]: " IN_DB_USER
    POSTGRES_USER="${IN_DB_USER:-crm_user}"

    read -rsp "PostgreSQL password: " POSTGRES_PASSWORD
    echo ""
    while [ -z "$POSTGRES_PASSWORD" ]; do
        read -rsp "Password cannot be empty. PostgreSQL password: " POSTGRES_PASSWORD
        echo ""
    done

    # Automatically derive DATABASE_URL
    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

    echo ""
    echo "AI CONFIGURATION"
    echo "----------------------------------------"
    read -rsp "Gemini API key (optional for AI email templates): " GEMINI_API_KEY
    echo ""
    if [ -z "$GEMINI_API_KEY" ]; then
        echo "  - No Gemini API key provided. Automatic fallback template mode will be enabled."
    fi

    echo ""
    echo "EMAIL CONFIGURATION"
    echo "----------------------------------------"
    read -rp "SMTP server [smtpout.secureserver.net]: " IN_SMTP_SERVER
    SMTP_SERVER="${IN_SMTP_SERVER:-smtpout.secureserver.net}"

    read -rp "SMTP port [465]: " IN_SMTP_PORT
    SMTP_PORT="${IN_SMTP_PORT:-465}"

    read -rp "Sender email [noreply@crm.com]: " IN_SENDER_EMAIL
    SENDER_EMAIL="${IN_SENDER_EMAIL:-noreply@crm.com}"

    read -rsp "Sender password (optional for dry-run simulation): " SENDER_PASSWORD
    echo ""

    read -rp "Sender name [CRM Business Team]: " IN_SENDER_NAME
    SENDER_NAME="${IN_SENDER_NAME:-CRM Business Team}"

    echo ""
    echo "APPLICATION SECRETS"
    echo "----------------------------------------"
    echo -n "Generating application security keys... "
    SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || LC_ALL=C tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 64)
    JWT_SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || LC_ALL=C tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 64)
    echo "✓"

    echo ""
    echo "CRM PORT CONFIGURATION"
    echo "----------------------------------------"
    PORT_OK=0
    DEFAULT_PORT=80
    while [ "$PORT_OK" -eq 0 ]; do
        read -rp "CRM port [$DEFAULT_PORT]: " IN_PORT
        CRM_PORT="${IN_PORT:-$DEFAULT_PORT}"

        if ! [[ "$CRM_PORT" =~ ^[0-9]+$ ]] || [ "$CRM_PORT" -lt 1 ] || [ "$CRM_PORT" -gt 65535 ]; then
            echo "[ERROR] '$CRM_PORT' is not a valid TCP port."
            DEFAULT_PORT=8080
            continue
        fi

        # Check if selected host port is occupied
        if (command -v nc &>/dev/null && nc -z localhost "$CRM_PORT" &>/dev/null) || \
           (command -v lsof &>/dev/null && lsof -i:"$CRM_PORT" &>/dev/null) || \
           (command -v netstat &>/dev/null && netstat -an | grep -q ":$CRM_PORT "); then
            echo "[ERROR] Port $CRM_PORT is already in use."
            read -rp "Enter another CRM port: " ALT_PORT
            DEFAULT_PORT="${ALT_PORT:-8080}"
        else
            PORT_OK=1
        fi
    done

    # Write .env file cleanly
    cat <<EOF > .env
CRM_PORT=${CRM_PORT}
FLASK_ENV=production
SECRET_KEY=${SECRET_KEY}
JWT_SECRET_KEY=${JWT_SECRET_KEY}
POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=${DATABASE_URL}
GEMINI_API_KEY=${GEMINI_API_KEY}
SMTP_SERVER=${SMTP_SERVER}
SMTP_PORT=${SMTP_PORT}
SENDER_EMAIL=${SENDER_EMAIL}
SENDER_PASSWORD=${SENDER_PASSWORD}
SENDER_NAME=${SENDER_NAME}
EOF
    echo "Configuration   ✓ .env generated"
fi

# 3. Validate Configuration
set -a
source .env
set +a

MISSING_VAR=""
if [ -z "$POSTGRES_DB" ]; then MISSING_VAR="POSTGRES_DB"; fi
if [ -z "$POSTGRES_USER" ]; then MISSING_VAR="POSTGRES_USER"; fi
if [ -z "$POSTGRES_PASSWORD" ]; then MISSING_VAR="POSTGRES_PASSWORD"; fi
if [ -z "$JWT_SECRET_KEY" ]; then MISSING_VAR="JWT_SECRET_KEY"; fi

if [ -n "$MISSING_VAR" ]; then
    echo "[ERROR] Required environment variable '$MISSING_VAR' is missing or empty."
    echo "Please configure .env before continuing."
    exit 1
fi

# 4. Administrator Setup
echo ""
echo "ADMINISTRATOR SETUP"
echo "----------------------------------------"

INIT_ADMIN_EMAIL=""
INIT_ADMIN_PASSWORD=""

PROMPT_ADMIN=1
if [ -f ".db_initialized" ]; then
    echo "Existing installation detected. Administrator credentials will not be modified."
    PROMPT_ADMIN=0
fi

if [ "$PROMPT_ADMIN" -eq 1 ]; then
    read -rp "Admin email: " INIT_ADMIN_EMAIL
    while [ -z "$INIT_ADMIN_EMAIL" ]; do
        read -rp "Admin email cannot be empty. Admin email: " INIT_ADMIN_EMAIL
    done

    read -rsp "Admin password: " INIT_ADMIN_PASSWORD
    echo ""
    while [ ${#INIT_ADMIN_PASSWORD} -lt 6 ]; do
        read -rsp "Password must be at least 6 characters. Admin password: " INIT_ADMIN_PASSWORD
        echo ""
    done

    read -rsp "Confirm admin password: " CONFIRM_PASS
    echo ""
    while [ "$INIT_ADMIN_PASSWORD" != "$CONFIRM_PASS" ]; do
        echo "Passwords do not match."
        read -rsp "Admin password: " INIT_ADMIN_PASSWORD
        echo ""
        read -rsp "Confirm admin password: " CONFIRM_PASS
        echo ""
    done
    echo "Administrator   ✓ Credentials captured"
fi

# 5. Docker Installation Workflow
echo ""
echo "========================================"
echo "        BUILDING AI CRM"
echo "========================================"

docker compose build

echo "Starting PostgreSQL database container..."
docker compose up -d postgres

echo "Waiting for PostgreSQL database..."
DB_ATTEMPTS=0
until docker compose exec -T postgres pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" &>/dev/null || [ $DB_ATTEMPTS -ge 20 ]; do
    DB_ATTEMPTS=$((DB_ATTEMPTS+1))
    sleep 2
done

if [ "$DB_ATTEMPTS" -ge 20 ]; then
    echo "[ERROR] PostgreSQL failed to become healthy."
    echo "Inspect logs with: ./scripts/logs.sh"
    exit 1
fi

if [ "$PROMPT_ADMIN" -eq 1 ]; then
    echo "Initializing database tables and administrator account..."
    docker compose run --rm \
      -e INIT_ADMIN_EMAIL="$INIT_ADMIN_EMAIL" \
      -e INIT_ADMIN_PASSWORD="$INIT_ADMIN_PASSWORD" \
      backend python init_db.py
    touch .db_initialized
fi

echo "Starting application containers..."
docker compose up -d

# 6. Health & Readiness Verification
EFFECTIVE_PORT="${CRM_PORT:-80}"
echo "Polling application health and PyTorch Transformer status..."

HEALTH_ATTEMPTS=0
MAX_HEALTH_ATTEMPTS=30
BACKEND_HEALTHY=0
TRANSFORMER_READY=0

until [ "$HEALTH_ATTEMPTS" -ge "$MAX_HEALTH_ATTEMPTS" ]; do
    HEALTH_ATTEMPTS=$((HEALTH_ATTEMPTS+1))
    HEALTH_RESP=$(curl -s "http://localhost:${EFFECTIVE_PORT}/api/health" 2>/dev/null || true)

    if [[ "$HEALTH_RESP" == *"healthy"* ]]; then
        BACKEND_HEALTHY=1
    fi
    if [[ "$HEALTH_RESP" == *"ready"* ]]; then
        TRANSFORMER_READY=1
        break
    fi
    sleep 3
done

if [ "$BACKEND_HEALTHY" -ne 1 ]; then
    echo "[ERROR] Backend failed to become healthy."
    echo "Inspect logs with: ./scripts/logs.sh"
    exit 1
fi

if [ "$TRANSFORMER_READY" -ne 1 ]; then
    echo "[ERROR] Transformer model failed to load."
    echo "Inspect logs with: ./scripts/logs.sh"
    exit 1
fi

# 7. Final Summary Display
ADMIN_DISPLAY_EMAIL="${INIT_ADMIN_EMAIL:-Existing Admin Account}"

echo ""
echo "========================================"
echo "       AI CRM INSTALLATION COMPLETE"
echo "========================================"
echo ""
echo "Frontend:       ✓ Available"
echo "Backend:        ✓ Healthy"
echo "PostgreSQL:     ✓ Connected"
echo "Transformer:    ✓ Ready"
echo "Configuration:  ✓ Validated"
echo ""
echo "CRM URL:"
echo "http://localhost:${EFFECTIVE_PORT}"
echo ""
echo "Swagger:"
echo "http://localhost:${EFFECTIVE_PORT}/apidocs"
echo ""
echo "Administrator:"
echo "${ADMIN_DISPLAY_EMAIL}"
echo ""
echo "========================================"
