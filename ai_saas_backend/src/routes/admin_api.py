from flask import Blueprint, jsonify
from extensions import jwt_required, get_jwt_identity
from utils import admin_required
from models import User

admin_api = Blueprint("admin_api", __name__)

# Exemplo: listar todos os usuários (só admin)
@admin_api.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def list_all_users():
    users = User.query.all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "plan": user.plan,
            "tokens_available": user.tokens_available,
            "is_active": user.is_active
        })
    return jsonify(result)