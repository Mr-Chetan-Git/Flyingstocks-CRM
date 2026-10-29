import os
import socket
from pathlib import Path
from dotenv import load_dotenv

# Ensure root .env is loaded regardless of execution directory
root_dir = Path(__file__).resolve().parent.parent
dotenv_path = root_dir / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path=dotenv_path)
else:
    load_dotenv()


def _resolve_database_url():
    url = os.getenv("DATABASE_URL")
    if url and "@postgres" in url:
        try:
            socket.gethostbyname("postgres")
        except (socket.gaierror, OSError):
            url = url.replace("@postgres:", "@127.0.0.1:").replace("@postgres/", "@127.0.0.1/")
    return url


class Config:
    APP_NAME = os.getenv("APP_NAME")
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", 5000))

    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")

    SQLALCHEMY_DATABASE_URI = _resolve_database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Security & JWT Configuration
    SECRET_KEY = os.getenv("SECRET_KEY", "crm_secret_key_2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400))
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

    # GoDaddy / Custom SMTP Email Configuration
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtpout.secureserver.net")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
    SENDER_EMAIL = os.getenv("SENDER_EMAIL", "")
    SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "")
    SENDER_NAME = os.getenv("SENDER_NAME", "CRM Business Team")
    SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "True").lower() in ("true", "1", "yes")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "False").lower() in ("true", "1", "yes")

    @classmethod
    def validate_smtp_config(cls):
        missing = []
        if not cls.SENDER_EMAIL:
            missing.append("SENDER_EMAIL")
        if not cls.SENDER_PASSWORD:
            missing.append("SENDER_PASSWORD")
        
        if missing:
            print(f"⚠️  [SMTP CONFIG WARNING] Missing environment variables: {', '.join(missing)}")
            print("    -> Bulk SMTP email sending will run in Dry-Run/Simulation mode until valid credentials are added to .env.")
            return False
        print("✅ [SMTP CONFIG VALIDATED] GoDaddy SMTP credentials detected successfully.")
        return True