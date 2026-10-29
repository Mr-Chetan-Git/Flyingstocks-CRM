from app import app
from database.connection import db
from models.user import User
from models.customer import Customer
from werkzeug.security import generate_password_hash

def seed_admin_user():
    with app.app_context():
        # Ensure database tables exist
        print("Creating database tables if they do not exist...")
        db.create_all()
        print("Database tables verified.")

        admin_email = "admin@example.com"
        admin_password = "123456"

        user = User.query.filter_by(email=admin_email).first()

        if not user:
            print(f"Creating admin user: {admin_email}")
            user = User(
                full_name="Admin",
                email=admin_email,
                password=generate_password_hash(admin_password),
                role="admin"
            )
            db.session.add(user)
            db.session.commit()
            print("[SUCCESS] Admin user created successfully!")
        else:
            print(f"Admin user {admin_email} already exists. Updating password...")
            user.password = generate_password_hash(admin_password)
            db.session.commit()
            print("[SUCCESS] Admin password updated successfully!")

if __name__ == "__main__":
    seed_admin_user()
