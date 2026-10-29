def validate_customer(data):

    errors = {}

    if not data or not data.get("name") or not str(data.get("name")).strip():
        errors["name"] = "Name is required"

    email = data.get("email") if data else None
    if email and str(email).strip():
        import re
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", str(email).strip()):
            errors["email"] = "Invalid email format"

    return errors