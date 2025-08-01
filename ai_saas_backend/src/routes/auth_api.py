from flask import Blueprint, request, jsonify, make_response
from extensions import (
    bcrypt, db, limiter, redis_client,
    jwt_required, create_access_token, get_jwt, get_jwt_identity
)
from utils import add_token_to_blacklist
from models import User, Plan
from dotenv import load_dotenv
import uuid, re, os, secrets
from datetime import timedelta
from routes.email_api import send_reset_password_email

auth_api = Blueprint("auth_api", __name__)

load_dotenv()

# Criar usuário
@auth_api.route("/", methods=["POST"])
def create_user():
    data = request.form
    file = request.files.get("perfil_photo")

    def is_valid_email(email):
        return re.match(r"[^@]+@[^@]+\.[^@]+", email)

    if not is_valid_email(data.get("email", "")):
        return jsonify({"error": "Email inválido"}), 400

    required_fields = ["full_name", "username", "email", "password"]
    for field in required_fields:
        if field not in data or not data.get(field):
            return jsonify({"error": f"Campo obrigatório: {field}"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username já existe"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email já cadastrado"}), 400

    password = data["password"]
    pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$"
    if not re.match(pattern, password):
        return jsonify({"error": "Senha fraca"}), 400

    perfil_path = None
    if file:
        filename = f"{uuid.uuid4()}_{file.filename}"
        upload_dir = os.path.join("static", "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        perfil_path = filepath

    email = data["email"]
    email_verified = redis_client.get(f"email_verified:{email}")
    if email_verified is None:
        return jsonify({"error": "Email ainda não verificado"}), 400

    if isinstance(email_verified, bytes):
        email_verified = email_verified.decode()

    if email_verified != "true":
        return jsonify({"error": "Email ainda não verificado"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    # Buscar plano Free
    free_plan = Plan.query.filter_by(name="Premium").first()
    if not free_plan:
        return jsonify({"error": "Plano Free não encontrado"}), 500

    new_user = User(
        id=str(uuid.uuid4()),
        full_name=data["full_name"],
        username=data["username"],
        email=data["email"],
        password=hashed_password,
        perfil_photo=perfil_path,
        payment_method=data.get("payment_method"),
        plan=free_plan  # Associa o plano Free automaticamente
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuário criado com sucesso", "id": new_user.id}), 201


# Login
@auth_api.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    identifier = data.get("identifier")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({"error": "Usuário (ou email) e senha são obrigatórios"}), 400

    if "@" in identifier:
        user = User.query.filter_by(email=identifier).first()
    else:
        user = User.query.filter_by(username=identifier).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(
            identity=user.id,
            additional_claims={"role": user.role},
            expires_delta=timedelta(hours=2)
        )
        resp = make_response(jsonify({
            "message": "Login bem-sucedido",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "plan": user.plan.name if user.plan else None,
                "tokens_available": user.plan.tokens_available if user.plan else 0,
                "payment_method": user.payment_method,
                "perfil_photo": user.perfil_photo,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat()
            }
        }))
        resp.set_cookie(
            "access_token_cookie",
            access_token,
            httponly=True,
            secure=False,  # Em produção, mude para True
            samesite="Strict",
            max_age=60 * 60 * 2
        )
        return resp
    else:
        return jsonify({"error": "Credenciais inválidas"}), 401


# Logout
@auth_api.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    expires = 60 * 60 * 2  # 2 horas
    add_token_to_blacklist(jti, expires)
    return jsonify({"message": "Logout realizado com sucesso"}), 200


# Verificar senha atual do usuário
@auth_api.route("/verify-password", methods=["POST"])
@jwt_required()
def verify_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "Usuário inválido"}), 403

    data = request.get_json()
    password = data.get("password")
    if not password:
        return jsonify({"error": "Senha é obrigatória"}), 400

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Senha incorreta"}), 401

    return jsonify({"message": "Senha correta"}), 200


# Solicitar link para redefinição de senha
@auth_api.route("/request-password-reset", methods=["POST"])
def request_password_reset():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email é obrigatório"}), 400

    user = User.query.filter_by(email=email).first()
    # Resposta genérica para segurança
    if not user:
        return jsonify({"message": "Se esse email estiver cadastrado, enviaremos o link para redefinição"}), 200

    token = secrets.token_urlsafe(64)
    redis_client.setex(f"reset_token:{token}", timedelta(hours=1), user.id)

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/login/reset-password/{token}"
    send_reset_password_email(user.email, reset_link)

    return jsonify({"message": "Link de redefinição enviado para o email"}), 200


# Resetar senha usando token
@auth_api.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    user_id = redis_client.get(f"reset_token:{token}")
    if not user_id:
        return jsonify({"error": "Token expirado ou inválido"}), 400

    if isinstance(user_id, bytes):
        user_id = user_id.decode()

    data = request.get_json()
    new_password = data.get("password")

    pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$"
    if not new_password or not re.match(pattern, new_password):
        return jsonify({
            "error": "Senha inválida. Deve conter ao menos 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial."
        }), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()
    redis_client.delete(f"reset_token:{token}")

    return jsonify({"message": "Senha redefinida com sucesso"}), 200