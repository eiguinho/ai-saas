from flask import Blueprint, request, jsonify
from extensions import (
    bcrypt, db, jwt_required, get_jwt_identity
)
from models import User
from dotenv import load_dotenv
import re

user_api = Blueprint("user_api", __name__)

load_dotenv()

# Obter dados do usuário
@user_api.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    if current_user.id != user_id and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    user_data = {
        "id": user.id,
        "full_name": user.full_name,
        "username": user.username,
        "payment_method": user.payment_method,
    }
    return jsonify(user_data), 200

# Atualizar usuário
@user_api.route("/<user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    if current_user.id != user_id and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON vazio"}), 400

    if current_user.role != "admin":
        for campo_restrito in ["role", "plan", "tokens_available", "is_active"]:
            data.pop(campo_restrito, None)

    if "full_name" in data:
        user.full_name = data["full_name"]

    if "username" in data:
        if User.query.filter(User.username == data["username"], User.id != user.id).first():
            return jsonify({"error": "Username já existe"}), 400
        user.username = data["username"]

    if "email" in data:
        if User.query.filter(User.email == data["email"], User.id != user.id).first():
            return jsonify({"error": "Email já cadastrado"}), 400
        user.email = data["email"]

    if "password" in data:
        password = data["password"]
        pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$"
        if not re.match(pattern, password):
            return jsonify({
                "error": "Senha precisa ter pelo menos 8 caracteres, uma maiúscula, uma minúscula, um número e um caractere especial"
            }), 400
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user.password = hashed_password

    if "payment_method" in data:
        user.payment_method = data["payment_method"]

    db.session.commit()
    return jsonify({"message": "Usuário atualizado com sucesso"}), 200

# Deletar usuário
@user_api.route("/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    if current_user.id != user_id and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Usuário excluído com sucesso"}), 200

# Dados do usuário logado
@user_api.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    return jsonify({
        "id": user.id,
        "full_name": user.full_name,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "plan": user.plan,
        "tokens_available": user.tokens_available,
        "payment_method": user.payment_method,
        "perfil_photo": user.perfil_photo,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat()
    }), 200