@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo     AI-Powered CRM — Windows Installation ^& Deployment   
echo ==========================================================
echo.

:: 1. Check Docker
echo [1/6] Checking system prerequisites...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker is not installed or not in PATH.
    pause
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker Desktop daemon is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo   - Docker ^& Docker Compose verified.

:: 2. Environment file setup
echo [2/6] Checking environment configuration (.env)...
if not exist ".env" (
    echo   - Creating .env from .env.example...
    copy .env.example .env
    echo   ⚠️ Created default .env file. Please review credentials in .env if needed.
)

:: 3. Build containers
echo [3/6] Building Docker images...
docker compose build
if %errorlevel% neq 0 (
    echo ❌ Docker compose build failed.
    pause
    exit /b 1
)

:: 4. Start database and initialize
echo [4/6] Starting database container...
docker compose up -d postgres

echo   - Initializing database tables and admin account...
docker compose run --rm backend python init_db.py

:: 5. Launch stack
echo [5/6] Starting all CRM application containers...
docker compose up -d

:: 6. Status summary
echo [6/6] Checking running container status...
docker compose ps

echo.
echo ==========================================================
echo         🎉 AI CRM INSTALLATION COMPLETE 🎉               
echo ==========================================================
echo   Frontend Application: http://localhost
echo   Backend REST API:     http://localhost/api
echo   Swagger API Docs:     http://localhost/apidocs
echo ==========================================================
echo   To check status: docker compose ps
echo   To view logs:     docker compose logs -f
echo   To stop:          docker compose down
echo ==========================================================
echo.
pause
