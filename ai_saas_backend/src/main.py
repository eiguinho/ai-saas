from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from extensions import bcrypt
from routes.user_api import user_api
from models import db
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Caminho do banco SQLite
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "app.db")

# Configuração do banco
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = 'secret'

# Inicializa o SQLAlchemy
db.init_app(app)

with app.app_context():
    db.create_all()

# Inicializa o Bcrypt
bcrypt.init_app(app)

app.register_blueprint(user_api)

@app.route("/api/health")
def health():
    return {"status": "ta joia"}

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
