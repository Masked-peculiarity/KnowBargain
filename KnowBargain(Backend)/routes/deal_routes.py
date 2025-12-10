# routes/deal_routes.py
from flask import Blueprint, request, jsonify
from models import db, Deal, Comment, Vote, PriceHistory, User
from utils.jwt_utils import verify_jwt
from datetime import datetime
import random

deal_bp = Blueprint("deal_bp", __name__, url_prefix="/api/deals")


# ---------- Helper: Get current user from JWT ----------
def get_current_user():
    """Extract user from JWT in Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None, jsonify({"error": "Missing token"}), 401

    token = auth_header.split(" ")[1] if " " in auth_header else auth_header
    user_data = verify_jwt(token)
    if not user_data:
        return None, jsonify({"error": "Invalid token"}), 401
    
    user_id = user_data.get("id") or user_data.get("user_id")
    if not user_id:
        return None, "Invalid token payload", 401

    user = User.query.get(user_id)
    if not user:
        return None, jsonify({"error": "User not found"}), 404
    return user, None, 200


# ---------- 1️⃣ Create a New Deal ----------
@deal_bp.route("/", methods=["POST"])
def create_deal():
    user, err, code = get_current_user()
    if err:
        return err, code

    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    category = data.get("category")
    link = data.get("link")
    price = data.get("price")
    image_url = data.get("image_url")

    if not title or not price:
        return jsonify({"error": "Title and price required"}), 400

    deal = Deal(
        title=title,
        description=description,
        category=category,
        link=link,
        price=price,
        image_url=image_url,
        user_id=user.id,
    )

    db.session.add(deal)
    db.session.commit()

    # Add initial price history
    history = PriceHistory(deal_id=deal.id, price=price)
    db.session.add(history)
    db.session.commit()

    return jsonify({"message": "Deal created successfully", "deal_id": deal.id}), 201


# ---------- 2️⃣ Fetch All Deals ----------
@deal_bp.route("/", methods=["GET"])
def get_deals():
    deals = Deal.query.order_by(Deal.created_at.desc()).all()

    deal_list = []
    for d in deals:
        deal_list.append({
            "id": d.id,
            "title": d.title,
            "description": d.description,
            "category": d.category,
            "link": d.link,
            "price": d.price,
            "status": d.status,
            "image_url": d.image_url,
            "username": d.user.username,
            "reputation": d.user.reputation,
            "score": d.total_score(),
            "created_at": d.created_at,
            "comment_count": len(d.comments),
        })

    return jsonify(deal_list), 200


@deal_bp.route("/<int:deal_id>", methods=["GET"])
def get_deal(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    res = {
        "id": deal.id,
        "title": deal.title,
        "description": deal.description,
        "category": deal.category,
        "link": deal.link,
        "price": deal.price,
        "status": deal.status,
        "image_url": deal.image_url,
        "username": deal.user.username,
        "created_at": deal.created_at,
        "score": deal.total_score(),
    }
    return jsonify(res), 200


@deal_bp.route("/<int:deal_id>/save", methods=["POST"])
def save_deal(deal_id):
    user, err, code = get_current_user()
    if err: return err, code
    deal = Deal.query.get_or_404(deal_id)
    if deal in user.saved.all():
        user.saved.remove(deal)
        db.session.commit()
        return jsonify({"message": "Deal unsaved"}), 200
    else:
        user.saved.append(deal)
        db.session.commit()
        return jsonify({"message": "Deal saved"}), 200

@deal_bp.route("/saved", methods=["GET"])
def get_saved_deals():
    user, err, code = get_current_user()
    if err: 
        return err, code
    deals = [{
        "id": d.id,
        "title": d.title,
        "price": d.price,
        "image_url": d.image_url,
        "link": d.link,
        "status": d.status,
        "comment_count": len(d.comments),
    } for d in user.saved.all()]
    return jsonify(deals), 200


# ----------  Vote on a Deal ----------
@deal_bp.route("/<int:deal_id>/vote", methods=["POST"])
def vote_deal(deal_id):
    user, err, code = get_current_user()
    if err:
        return err, code

    data = request.get_json()
    vote_type = data.get("vote_type")  # 'up' or 'down'

    if vote_type not in ["up","down"]:
        return jsonify({"error": "Invalid vote type"}), 400

    deal = Deal.query.get_or_404(deal_id)
    existing_vote = Vote.query.filter_by(user_id=user.id, deal_id=deal.id).first()

    # If user already voted, update vote type
    if existing_vote:
        if existing_vote.vote_type == vote_type:
            db.session.delete(existing_vote)
            db.session.commit()
            return jsonify({"message": "Vote removed", "score": deal.total_score()}), 200
        else:
            # Change vote direction
            existing_vote.vote_type = vote_type
            db.session.commit()
            return jsonify({"message": "Vote updated", "score": deal.total_score()}), 200
    else:
        new_vote = Vote(user_id=user.id, deal_id=deal.id, vote_type=vote_type)
        db.session.add(new_vote)
        db.session.commit()
        return jsonify({"message": "Vote recorded", "score": deal.total_score()}), 200


# ---------- 4️⃣ Add a Comment ----------
@deal_bp.route("/<int:deal_id>/comments", methods=["POST"])
def add_comment(deal_id):
    user, err, code = get_current_user()
    if err:
        return err, code

    data = request.get_json()
    content = data.get("content")
    if not content:
        return jsonify({"error": "Comment cannot be empty"}), 400

    comment = Comment(user_id=user.id, deal_id=deal_id, content=content)
    db.session.add(comment)
    db.session.commit()
    return jsonify({"message": "Comment added"}), 201


# ---------- 5️⃣ Get Comments for a Deal ----------
@deal_bp.route("/<int:deal_id>/comments", methods=["GET"])
def get_comments(deal_id):
    comments = Comment.query.filter_by(deal_id=deal_id).order_by(Comment.created_at.desc()).all()
    res = [{
        "id": c.id,
        "content": c.content,
        "username": c.user.username,
        "created_at": c.created_at
    } for c in comments]
    return jsonify(res), 200


# ---------- 6️⃣ Simulate Price Change ----------
@deal_bp.route("/<int:deal_id>/simulate_price_change", methods=["POST"])
def simulate_price_change(deal_id):
    """Adds a random ±5–15% price variation to simulate tracking."""
    deal = Deal.query.get_or_404(deal_id)
    change_factor = random.uniform(0.85, 1.15)
    new_price = round(deal.price * change_factor, 2)
    deal.price = new_price

    history = PriceHistory(deal_id=deal.id, price=new_price)
    db.session.add(history)
    db.session.commit()

    return jsonify({
        "message": "Price updated",
        "new_price": new_price,
        "timestamp": history.timestamp
    }), 200


# ---------- 7️⃣ Get Price History ----------
@deal_bp.route("/<int:deal_id>/price_history", methods=["GET"])
def get_price_history(deal_id):
    history = PriceHistory.query.filter_by(deal_id=deal_id).order_by(PriceHistory.timestamp.asc()).all()
    return jsonify([{
        "price": h.price,
        "timestamp": h.timestamp
    } for h in history]), 200

