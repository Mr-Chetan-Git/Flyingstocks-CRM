# AI-Powered Customer Relationship Management (CRM)

The AI-Powered Customer Relationship Management (CRM) System is a full-stack web application designed to manage customer information while leveraging a custom PyTorch Transformer AI model to generate intelligent customer summaries, predictions, and recommendations.

---

## 🚀 Docker Client Deployment & Quick Start

The CRM is fully containerized using Docker and Docker Compose. No manual installation of Python, Node.js, PyTorch, or PostgreSQL is required.

### Prerequisites

* **Docker** (v20.10 or higher)
* **Docker Compose** (v2.0 or higher)
* **Minimum System Requirements**: 2 CPU cores, 4 GB RAM, 10 GB free disk space.

---

### 1. Installation

Run the automated installer script:

**Linux / macOS:**
```bash
./install.sh
```

**Windows:**
```cmd
install.bat
```

The installer will:
1. Validate system prerequisites and Docker daemon status.
2. Generate `.env` from `.env.example` if not present.
3. Validate mandatory configuration variables.
4. Prompt interactively for initial Administrator credentials (`Admin Email` and `Admin Password`).
5. Build production Docker images for Frontend, Backend, and PostgreSQL.
6. Initialize database tables (`db.create_all()`) and seed the administrator account.
7. Perform automated health checks on the Flask backend and PyTorch Transformer engine.

---

### 2. Accessing the Application

Once installation completes:

* **Frontend UI**: [http://localhost](http://localhost) (or `http://localhost:8080` if custom `CRM_PORT` is set)
* **Backend REST API**: `http://localhost/api`
* **Swagger API Documentation**: `http://localhost/apidocs`

Default login credentials are the Admin Email and Password specified during `./install.sh`.

---

### 3. Management Scripts

A suite of helper scripts is provided in the `scripts/` folder:

| Command | Description |
| :--- | :--- |
| `./scripts/start.sh` | Starts all CRM containers in background mode. |
| `./scripts/stop.sh` | Stops all containers safely (preserves database volume `postgres_data`). |
| `./scripts/restart.sh` | Restarts all containers. |
| `./scripts/status.sh` | Displays container status and backend API health. |
| `./scripts/logs.sh` | Displays live logs across all containers. |
| `./scripts/backup.sh` | Creates a timestamped PostgreSQL backup in `backups/crm_YYYY-MM-DD_HH-MM.sql`. |
| `./scripts/restore.sh` | Safely restores database from a selected SQL backup file. |

---

## ⚙️ Environment Configuration (`.env`)

Key configuration settings in `.env`:

```env
# Application Host Port Mapping
CRM_PORT=80

# Security Secrets
FLASK_ENV=production
SECRET_KEY=your_random_secret_key
JWT_SECRET_KEY=your_random_jwt_secret

# PostgreSQL Database Configuration
POSTGRES_DB=crm_db
POSTGRES_USER=crm_user
POSTGRES_PASSWORD=your_postgres_password

# Gemini AI API Key (For AI Email Campaign Generation)
GEMINI_API_KEY=your_gemini_api_key

# GoDaddy / SMTP Configuration
SMTP_SERVER=smtpout.secureserver.net
SMTP_PORT=465
SENDER_EMAIL=your_email@domain.com
SENDER_PASSWORD=your_smtp_password
SENDER_NAME=CRM Business Team
```

---

## 🏗 Architecture Overview

```text
                                CLIENT BROWSER
                                      │
                                      ▼ [Port 80 / CRM_PORT]
                       ┌──────────────────────────────┐
                       │      frontend container      │
                       │                              │
                       │  Nginx Reverse Proxy         │
                       │  React Static Production     │
                       │  Vite SPA Build              │
                       │                              │
                       │  /api ───────────────┐       │
                       └──────────────────────┼───────┘
                                              │
                                              ▼
                               ┌──────────────────────────────┐
                               │       backend container      │
                               │                              │
                               │  Flask REST API              │
                               │  Gunicorn WSGI Server        │
                               │  PyTorch Transformer AI      │
                               │  Email Campaign Engine       │
                               └──────────────┬───────────────┘
                                              │
                                              ▼
                               ┌──────────────────────────────┐
                               │       postgres container     │
                               │                              │
                               │  PostgreSQL 15 Database      │
                               │  Volume: postgres_data       │
                               └──────────────────────────────┘
```

---

## 🤖 PyTorch Transformer & AI Features

* **Custom PyTorch Engine**: Runs inside the Flask backend process using `summarization_model.pt` (~25.9 MB).
* **CPU Execution**: CPU-mode PyTorch (`torch.device("cpu")`), allowing deployment on any laptop, desktop, or cloud server without GPU drivers.
* **AI Note Summarization**: Automatically summarizes long customer interaction comments into concise takeaways.
* **AI Lead Prediction**: Predicts lead status (`Hot`, `Cold`, `Registered`, `Next Batch`) based on call records.
* **AI Email Campaigns**: Generates structured email templates using Google Gemini API (with FreeLLM fallback) and sends targeted bulk campaigns asynchronously over SMTP.

---

## 💾 Database Persistence & Backups

Database records are stored in a persistent Docker volume `postgres_data`. Stopping containers (`./scripts/stop.sh` or `docker compose down`) preserves all customer data, users, and email logs.

To create an explicit SQL backup:
```bash
./scripts/backup.sh
```

To restore from a backup:
```bash
./scripts/restore.sh
```

---

## 🛠 Troubleshooting

1. **Port 80 Conflict**:
   If host port 80 is occupied by another service (e.g., IIS or Apache), set `CRM_PORT=8080` in `.env` and run `./scripts/restart.sh`.
2. **Container Logs**:
   To inspect runtime exceptions or logs, run `./scripts/logs.sh`.
3. **Database Connection Issues**:
   Ensure `postgres` container status reports `healthy` via `./scripts/status.sh`.
