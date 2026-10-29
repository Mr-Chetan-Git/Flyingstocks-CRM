from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

from models.user import User
from database.connection import db


class AuthService:

    # -------------------------
    # REGISTER
    # -------------------------
    @staticmethod
    def register_user(data):

        existing_user = User.query.filter_by(
            email=data["email"]
        ).first()

        if existing_user:
            return None, "Email already exists"

        hashed_password = generate_password_hash(
            data["password"]
        )

        user = User(
            full_name=data["full_name"],
            email=data["email"],
            password=hashed_password,
            role=data.get("role", "employee")
        )

        db.session.add(user)
        db.session.commit()

        return user, None


    # -------------------------
    # LOGIN
    # -------------------------
    @staticmethod
    def login(data):

        user = User.query.filter_by(
            email=data["email"]
        ).first()

        if not user:
            return None, "Invalid email"

        if not check_password_hash(
            user.password,
            data["password"]
        ):
            return None, "Invalid password"

        token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "email": user.email,
                "role": user.role
            }
        )

        return {
            "token": token,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            }
        }, None