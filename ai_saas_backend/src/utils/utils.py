from extensions import redis_client, db
from models import User, Plan

from flask_jwt_extended.exceptions import RevokedTokenError
import redis

def add_token_to_blacklist(jti, expires_in):
    redis_client.setex(jti, expires_in, "revoked")

def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    try:
        token_in_redis = redis_client.get(jti)
    except redis.exceptions.ConnectionError:
        raise RevokedTokenError("Serviço de autenticação temporariamente indisponível.", jwt_data=jwt_payload)
    return token_in_redis is not None

def create_default_plans():
    free = Plan.query.filter_by(name="Free").first()
    premium = Plan.query.filter_by(name="Premium").first()

    if not free:
        free = Plan(name="Free", price=0.0, tokens_available=0)
        db.session.add(free)
    if not premium:
        premium = Plan(name="Premium", price=29.90, tokens_available=1000)
        db.session.add(premium)

    db.session.commit()