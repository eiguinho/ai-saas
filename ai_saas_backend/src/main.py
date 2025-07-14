from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter.errors import RateLimitExceeded
from dotenv import load_dotenv
from extensions import bcrypt, jwt, RevokedTokenError, db, limiter
from utils import check_if_token_revoked
from routes import user_api, admin_api, auth_api, email_api, profile_api
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Caminho do banco SQLite
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "app.db")

# Configuração do banco
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = os.getenv("SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = False  # TRUE DEPOIS
app.config["JWT_ACCESS_COOKIE_PATH"] = "/"
app.config["JWT_COOKIE_CSRF_PROTECT"] = False  #ATIVAR DEPOIS pra testes deixe False
app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token_cookie"

# Inicializa o SQLAlchemy
db.init_app(app)

# Inicializa o Bcrypt
bcrypt.init_app(app)

# Inicializa o JWT
jwt.init_app(app)

limiter.init_app(app)

with app.app_context():
    db.create_all()

# Configura blacklist com JWTManager
@jwt.token_in_blocklist_loader
def check_if_token_revoked_callback(jwt_header, jwt_payload):
    return check_if_token_revoked(jwt_header, jwt_payload)

@app.errorhandler(RateLimitExceeded)
def ratelimit_handler(e):
    return jsonify({"error": "Você excedeu o número máximo de tentativas de login. Tente novamente mais tarde."}), 429

@app.errorhandler(RevokedTokenError)
def handle_revoked_token(err):
    response = jsonify({"msg": str(err)})
    response.status_code = 401  # Unauthorized
    return response

# Rota para servir imagens de perfil
@app.route("/static/uploads/<path:filename>")
def serve_user_photo(filename):
    uploads_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads"))
    return send_from_directory(uploads_path, filename)

# Registra blueprint
app.register_blueprint(user_api, url_prefix="/api/users")
app.register_blueprint(admin_api, url_prefix="/api/admin")
app.register_blueprint(auth_api, url_prefix="/api/auth")
app.register_blueprint(email_api, url_prefix="/api/email")
app.register_blueprint(profile_api, url_prefix="/api/users")

if __name__ == "__main__":
    app.run(debug=True)
