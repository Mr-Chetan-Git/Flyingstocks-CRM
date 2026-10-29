from flask import Blueprint, request

from services.auth_service import AuthService
from validators.auth_validator import validate_register
from utils.response import success_response, error_response

auth_bp = Blueprint("auth", __name__)
# ==========================================
# LOGIN
# ==========================================
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data.get("email"):
        return error_response(
            "Email is required",
            400
        )

    if not data.get("password"):
        return error_response(
            "Password is required",
            400
        )

    response, error = AuthService.login(data)

    if error:
        return error_response(
            error,
            401
        )

    return success_response(
        "Login successful",
        response
    )


# ==========================================
# REGISTER
# ==========================================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    errors = validate_register(data)
    if errors:
        return error_response(errors, 400)

    user, error = AuthService.register_user(data)
    if error:
        return error_response(error, 400)

    return success_response(
        "User registered successfully",
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        },
        201
    )