# backend/models.py
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import hashlib, os

db = SQLAlchemy()

# ---------- Helper: password hashing ----------
def hash_password(password: str) -> str:
    """Create a salted SHA-256 hash for the given password."""
    salt = os.urandom(16).hex()          # random salt
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${hashed}"            # store salt and hash together


def verify_password(stored: str, provided: str) -> bool:
    """Check if provided password matches stored one."""
    salt, hashed = stored.split("$")
    check_hash = hashlib.sha256((salt + provided).encode()).hexdigest()
    return hashed == check_hash


saved_deals = db.Table(
    "saved_deals",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id")),
    db.Column("deal_id", db.Integer, db.ForeignKey("deals.id"))
)

# ---------- Models ----------

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    reputation = db.Column(db.Integer, default=0)

    # relationships
    deals = db.relationship("Deal", backref="user", lazy=True)
    comments = db.relationship("Comment", backref="user", lazy=True)
    votes = db.relationship("Vote", backref="user", lazy=True)
    saved = db.relationship("Deal", secondary="saved_deals", backref=db.backref("saved_by",lazy="dynamic"),lazy="dynamic")

    def set_password(self, pwd):
        self.password = hash_password(pwd)

    def check_password(self, pwd):
        return verify_password(self.password, pwd)


class Deal(db.Model):
    __tablename__ = "deals"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50))
    link = db.Column(db.String(255))
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="active")  # active, expired, out_of_stock
    image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # relationships
    comments = db.relationship("Comment", backref="deal", lazy=True)
    votes = db.relationship("Vote", backref="deal", lazy=True)
    price_history = db.relationship("PriceHistory", backref="deal", lazy=True)

    def total_score(self):
        up = sum(1 for v in self.votes if v.vote_type == "up")
        down = sum(1 for v in self.votes if v.vote_type == "down")
        return up - down


class PriceHistory(db.Model):
    __tablename__ = "price_history"

    id = db.Column(db.Integer, primary_key=True)
    deal_id = db.Column(db.Integer, db.ForeignKey("deals.id"), nullable=False)
    price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class Vote(db.Model):
    __tablename__ = "votes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    deal_id = db.Column(db.Integer, db.ForeignKey("deals.id"), nullable=False)
    vote_type = db.Column(db.String(10))  # 'up' or 'down'


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    deal_id = db.Column(db.Integer, db.ForeignKey("deals.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)



