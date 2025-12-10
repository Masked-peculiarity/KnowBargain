
from flask import Flask
from models import db
from flask_cors import CORS
from config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///knowbargain.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:8080", "http://127.0.0.1:8080"]}},
    supports_credentials=True
    )

    # register blueprints
    from routes.auth_routes import auth_bp
    from routes.deal_routes import deal_bp
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(deal_bp)
    
    return app