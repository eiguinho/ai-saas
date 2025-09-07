from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token, get_jwt, set_access_cookies
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis

# Inicializa Redis (mesmo host para todos)
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Extensões Flask
bcrypt = Bcrypt()
db = SQLAlchemy()
jwt = JWTManager()

# Flask-Limiter usando Redis (DB 1)
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379/1"
)