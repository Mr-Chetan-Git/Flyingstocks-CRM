import os
import sys
from app import app
from database.connection import db
from models.user import User
from werkzeug.security import generate_password_hash


def init_database():
    with app.app_context():
        print("Creating database tables if they do not exist...")
        db.create_all()
        print("Database tables verified.")

        # Check if an admin user already exists
        admin_user = User.query.filter_by(role="admin").first()

        if admin_user:
            print(f"[OK] Database initialized. Administrator '{admin_user.email}' already exists. No action required.")
            return

        # Check for initial setup credentials passed from install process
        init_email = os.getenv("INIT_ADMIN_EMAIL", "").strip()
        init_password = os.getenv("INIT_ADMIN_PASSWORD", "").strip()

        if not init_email or not init_password:
            print("[NOTICE] No administrator exists and INIT_ADMIN_EMAIL/INIT_ADMIN_PASSWORD not provided.")
            print("         Initial setup will require admin creation via setup script.")
            return

        print(f"Creating initial administrator account: {init_email}")
        new_admin = User(
            full_name="Administrator",
            email=init_email,
            password=generate_password_hash(init_password),
            role="admin"
        )
        db.session.add(new_admin)
        db.session.commit()
        print(f"[SUCCESS] Administrator '{init_email}' created successfully.")


if __name__ == "__main__":
    init_database()
