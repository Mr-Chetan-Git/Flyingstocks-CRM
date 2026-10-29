def validate_register(data):

    errors = {}

    if not data.get("full_name"):
        errors["full_name"] = "Full name is required"

    if not data.get("email"):
        errors["email"] = "Email is required"

    if not data.get("password"):
        errors["password"] = "Password is required"

    return errors