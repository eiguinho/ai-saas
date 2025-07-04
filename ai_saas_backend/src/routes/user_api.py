from flask import Blueprint, request, jsonify, abort
from extensions import bcrypt, db, jwt_required, create_access_token, get_jwt, get_jwt_identity
from utils import add_token_to_blacklist
from models import User
import uuid, re
from datetime import timedelta

user_api = Blueprint("user_api", __name__)

# GET /api/users/<id> - Detalhe de um usuário
@user_api.route("/api/users/<user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    # Só pode ver seu próprio usuário ou admin pode ver qualquer um
    if current_user.id != user_id and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

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
    def is_valid_email(email):
        return re.match(r"[^@]+@[^@]+\.[^@]+", email)
    if not is_valid_email(data["email"]):
        return jsonify({"error": "Email inválido"}), 400
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
# PUT /api/users/<id> - Atualizar usuário
@user_api.route("/api/users/<user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    # Só pode atualizar a si mesmo ou admin pode atualizar qualquer um
    if current_user.id != user_id and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON vazio"}), 400

    # Só admins podem atualizar esses campos
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
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    # Só pode deletar a si mesmo ou admin pode deletar qualquer um
    if current_user.id != user_id and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

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
        access_token = create_access_token(
                                                identity=user.id,
                                                additional_claims={"role": user.role},
                                                expires_delta=timedelta(hours=2)
                                            )
        return jsonify({
            "message": "Login bem-sucedido",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,   
            }
        }), 200
    else:
        return jsonify({"error": "Usuário ou senha inválidos"}), 401

@user_api.route("/api/users/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    expires = 60 * 60 * 2  # 2 horas, igual token expiration
    add_token_to_blacklist(jti, expires)
    return jsonify({"message": "Logout realizado com sucesso"}), 200