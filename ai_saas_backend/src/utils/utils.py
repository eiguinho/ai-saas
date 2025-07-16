from extensions import redis_client
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