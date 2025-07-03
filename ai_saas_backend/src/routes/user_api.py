from flask import Blueprint, request, jsonify, abort
from extensions import bcrypt
from models import db, User
import uuid, re

user_api = Blueprint("user_api", __name__)

# GET /api/users - Lista todos os usuários
@user_api.route("/api/users", methods=["GET"])
def get_users():
    users = User.query.all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email,
            "payment_method": user.payment_method
        })
    return jsonify(result)

# GET /api/users/<id> - Detalhe de um usuário
@user_api.route("/api/users/<user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    user_data = {
        "id": user.id,
        "full_name": user.full_name,
        "username": user.username,
        "payment_method": user.payment_method
    }
    return jsonify(user_data), 200

# POST /api/users - Criar usuário
@user_api.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()
    required_fields = ["full_name", "username", "email", "password"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Campo obrigatório: {field}"}), 400
    # Verifica username duplicado
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username já existe"}), 400
    # Verifica email duplicado
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email já cadastrado"}), 400    
    # Verifica requisitos senha
    password = data["password"]
    pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$"
    if not re.match(pattern, password):
        return jsonify({
            "error": "Senha precisa ter pelo menos 8 caracteres, "
                     "uma maiúscula, uma minúscula, um número e um caractere especial"
        }), 400
  
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
    new_user = User(
        id=str(uuid.uuid4()),
        full_name=data["full_name"],
        username=data["username"],
        email=data["email"],
        password=hashed_password,
        payment_method=data.get("payment_method")
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuário criado com sucesso", "id": new_user.id}), 201

# PUT /api/users/<id> - Atualizar usuário
@user_api.route("/api/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON vazio"}), 400

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
                "error": "Senha precisa ter pelo menos 8 caracteres, "
                         "uma maiúscula, uma minúscula, um número e um caractere especial"
            }), 400
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user.password = hashed_password

    if "payment_method" in data:
        user.payment_method = data["payment_method"]

    db.session.commit()
    return jsonify({"message": "Usuário atualizado com sucesso"}), 200

# DELETE /api/users/<id> - Excluir usuário
@user_api.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Usuário excluído com sucesso"}), 200

@user_api.route("/api/users/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data.get("username") or not data.get("password"):
        return jsonify({"error": "Usuário e senha são obrigatórios"}), 400

    user = User.query.filter_by(username=data["username"]).first()

    if user and bcrypt.check_password_hash(user.password, data["password"]):
        return jsonify({
            "message": "Login bem-sucedido",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name
            }
        }), 200
    else:
        return jsonify({"error": "Usuário ou senha inválidos"}), 401