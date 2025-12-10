# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from models import db, User, Deal, Comment,saved_deals
from utils.jwt_utils import create_jwt, verify_jwt
from flask import request
from routes.deal_routes import get_current_user

auth_bp = Blueprint("auth_bp", __name__)

# ---------- Signup ----------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not all([username, email, password]):
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "User already exists"}), 400

    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    token = create_jwt(user)
    return jsonify({"message": "User created", "token": token}), 201


# ---------- Login ----------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_jwt(user)
    return jsonify({"message": "Login successful", "token": token, "user_id": user.id}), 200



@auth_bp.route("/me", methods=["GET"])
def get_me():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"error": "Missing token"}), 401
    token = auth_header.split(" ")[1]
    data = verify_jwt(token)
    if not data:
        return jsonify({"error": "Invalid token"}), 401

    user = User.query.filter_by(id=data["id"]).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "reputation": user.reputation
    }), 200


@auth_bp.route("/stats", methods=["GET"])
def user_stats():
    user, err, code = get_current_user()
    if err:
        return err, code

    deals_count = Deal.query.filter_by(user_id=user.id).count()
    comments_count = Comment.query.filter_by(user_id=user.id).count()
    karma = user.reputation
    saved_count = db.session.query(saved_deals).filter_by(user_id=user.id).count()

    return jsonify({
        "deals": deals_count,
        "comments": comments_count,
        "karma": karma,
        "saved": saved_count,
    }), 200
