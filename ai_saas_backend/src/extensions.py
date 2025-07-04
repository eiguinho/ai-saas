from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, get_jwt, jwt_required, create_access_token, verify_jwt_in_request, get_jwt_identity
from flask_jwt_extended.exceptions import RevokedTokenError
from functools import wraps
from flask_sqlalchemy import SQLAlchemy
import redis

bcrypt = Bcrypt()
db = SQLAlchemy()
jwt = JWTManager()
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)