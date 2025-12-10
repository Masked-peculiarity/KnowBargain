# backend/utils/jwt_utils.py
import jwt
from flask import current_app, request, jsonify

# ---------- Create Token ----------
def create_jwt(user):
    """Generate a JWT with the user_id payload."""
    payload = {"id": user.id,
    "username": user.username,
    "email": user.email
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return token


# ---------- Verify Token ----------
def verify_jwt(token):
    """Decode the JWT and return payload if valid."""
    try:
        data = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return data
    except jwt.InvalidTokenError:
        return None


# ---------- Auth Decorator ----------
def token_required(f):
    """Decorator to protect routes that need authentication."""
    from functools import wraps

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", None)
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401

        token = auth_header.split(" ")[1]
        data = verify_jwt(token)
        if not data:
            return jsonify({"error": "Invalid token"}), 401

        # attach user_id for use inside route
        kwargs["user_id"] = data["user_id"]
        return f(*args, **kwargs)

    return decorated
