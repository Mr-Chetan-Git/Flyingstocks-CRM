
from routes.auth_routes import auth_bp
from flask_jwt_extended import JWTManager
from flask import Flask, jsonify
from flask_cors import CORS
from routes.dashboard_routes import dashboard_bp
from routes.customer_routes import customer_bp
from datetime import timedelta
from config import Config
from database.connection import db
from flasgger import Swagger
from routes.summary_routes import summary_bp


# ==========================================
# FLASK APP INITIALIZATION
# ==========================================

app = Flask(__name__)

Swagger(app)
CORS(app)


# ==========================================
# JWT CONFIGURATION
# ==========================================

app.config["SECRET_KEY"] = Config.SECRET_KEY
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)
app.config["JWT_ALGORITHM"] = Config.JWT_ALGORITHM

jwt = JWTManager(app)


# ==========================================
# JWT ERROR HANDLERS (HTTP 401)
# ==========================================

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"[JWT AUTH ERROR] Invalid token: {error}")
    return jsonify({
        "success": False,
        "message": error,
        "msg": error
    }), 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("[JWT AUTH ERROR] Token has expired")
    return jsonify({
        "success": False,
        "message": "Token has expired",
        "msg": "Token has expired"
    }), 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"[JWT AUTH ERROR] Authorization required: {error}")
    return jsonify({
        "success": False,
        "message": error,
        "msg": error
    }), 401


# ==========================================
# DATABASE CONFIGURATION
# ==========================================

app.config["SQLALCHEMY_DATABASE_URI"] = Config.SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = (
    Config.SQLALCHEMY_TRACK_MODIFICATIONS
)

db.init_app(app)


# ==========================================
# REGISTER BLUEPRINTS
# ==========================================

app.register_blueprint(
    dashboard_bp,
    url_prefix="/api"
)

from routes.email_routes import email_bp

app.register_blueprint(
    customer_bp,
    url_prefix="/api"
)

app.register_blueprint(
    auth_bp,
    url_prefix="/api"
)

app.register_blueprint(
    email_bp,
    url_prefix="/api"
)

app.register_blueprint(
    summary_bp,
    url_prefix="/api"
)


# ==========================================
# TRANSFORMER SERVICE
# ==========================================

from services.transformer_service import TransformerService


# Warm up Transformer model once during app initialization
try:
    TransformerService.initialize_model()
except Exception as e:
    print(f"Startup Transformer loading notice: {e}")


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/")
def home():
    return jsonify({
        "message": "CRM Backend Running"
    })


# ==========================================
# HEALTH CHECK
# ==========================================

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "database": "connected",
        "transformer": (
            "ready"
            if TransformerService._loaded
            else "not_loaded"
        )
    })


# ==========================================
# REGISTERED ROUTES
# ==========================================

print("\n===== Registered Routes =====")

for rule in app.url_map.iter_rules():
    print(rule)

print("=============================\n")


# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=True
    )
