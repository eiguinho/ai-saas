from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from extensions import bcrypt, jwt, RevokedTokenError, db
from utils import check_if_token_revoked
from routes import user_api, admin_api
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

# Inicializa o SQLAlchemy
db.init_app(app)

with app.app_context():
    db.create_all()

# Inicializa o Bcrypt
bcrypt.init_app(app)

# Inicializa o JWT
jwt.init_app(app)

# Configura blacklist com JWTManager
@jwt.token_in_blocklist_loader
def check_if_token_revoked_callback(jwt_header, jwt_payload):
    return check_if_token_revoked(jwt_header, jwt_payload)

@app.errorhandler(RevokedTokenError)
def handle_revoked_token(err):
    response = jsonify({"msg": str(err)})
    response.status_code = 401  # Unauthorized
    return response

# Registra blueprint
app.register_blueprint(user_api)
app.register_blueprint(admin_api)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
