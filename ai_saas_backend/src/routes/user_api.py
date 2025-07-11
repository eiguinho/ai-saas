from flask import Blueprint, request, jsonify, make_response
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from extensions import (
    bcrypt, db, jwt_required, create_access_token, get_jwt, get_jwt_identity,
    limiter, redis_client
)
from utils import add_token_to_blacklist
from models import User
from dotenv import load_dotenv
import uuid, re, os, smtplib, secrets
from datetime import timedelta
from email.mime.text import MIMEText

user_api = Blueprint("user_api", __name__)

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 465))

def send_verification_email(email, code):
    msg = MIMEText(f"Seu código de verificação é: {code}")
    msg["Subject"] = "Código de verificação - AI SaaS"
    msg["From"] = EMAIL_USER
    msg["To"] = email

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, [email], msg.as_string())
    except Exception as e:
        print("Erro ao enviar email:", e)

# Rota para solicitar código de verificação de email (para cadastro)
@user_api.route("/api/users/request-email-code", methods=["POST"])
def request_email_code():
    data = request.get_json()
    email = data.get("email")

    if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Email inválido"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email já cadastrado"}), 400

    code = str(uuid.uuid4().int)[-6:]
    redis_client.setex(f"email_code:{email}", timedelta(minutes=10), code)
    send_verification_email(email, code)
    return jsonify({"message": "Código enviado com sucesso"}), 200

# Rota para verificar código de email
@user_api.route("/api/users/verify-email-code", methods=["POST"])
def verify_email_code():
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")

    if not email or not code:
        return jsonify({"error": "Email e código são obrigatórios"}), 400

    expected = redis_client.get(f"email_code:{email}")

    # Decodifica somente se for bytes
    if isinstance(expected, bytes):
        expected = expected.decode()

    if not expected or expected != code:
        return jsonify({"error": "Código inválido ou expirado"}), 400

    redis_client.setex(f"email_verified:{email}", timedelta(minutes=30), "true")
    redis_client.delete(f"email_code:{email}")
    return jsonify({"message": "Email verificado com sucesso"}), 200

# Enviar código de segurança para o usuário autenticado (para ações sensíveis)
@user_api.route("/api/users/send-security-code", methods=["POST"])
@jwt_required()
def send_security_code():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não autenticado"}), 401

    code = str(uuid.uuid4().int)[-6:]
    redis_client.setex(f"security_code:{user.email}", timedelta(minutes=10), code)
    send_verification_email(user.email, code)
    return jsonify({"message": "Código de segurança enviado"}), 200

# Verificar código de segurança
@user_api.route("/api/users/verify-security-code", methods=["POST"])
@jwt_required()
def verify_security_code():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário inválido"}), 403

    data = request.get_json()
    code = data.get("code")
    if not code:
        return jsonify({"error": "Código é obrigatório"}), 400

    expected_code = redis_client.get(f"security_code:{user.email}")

    # Redis pode retornar None se não existir
    if not expected_code:
        return jsonify({"error": "Código incorreto ou expirado"}), 400

    # Converte para string se for bytes
    if isinstance(expected_code, bytes):
        expected_code = expected_code.decode()

    if expected_code != code:
        return jsonify({"error": "Código incorreto ou expirado"}), 400

    redis_client.delete(f"security_code:{user.email}")
    return jsonify({"message": "Código verificado com sucesso"}), 200

def send_reset_password_email(to_email, link):
    msg = MIMEText(
        f"Olá,\n\nClique no link abaixo para redefinir sua senha. Esse link expira em 1 hora.\n\n{link}\n\n"
        "Se você não solicitou essa redefinição, ignore esse email."
    )
    msg["Subject"] = "Redefinição de Senha"
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
    except Exception as e:
        print(f"Erro ao enviar email de redefinição: {e}")

# Solicitar link para redefinição de senha
@user_api.route("/api/users/request-password-reset", methods=["POST"])
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
@user_api.route("/api/users/reset-password/<token>", methods=["POST"])
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

# Verificar senha atual do usuário
@user_api.route("/api/users/verify-password", methods=["POST"])
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

# Atualizar foto de perfil
@user_api.route("/api/users/<user_id>/perfil-photo", methods=["PUT"])
@jwt_required()
def update_profile_photo(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    if current_user.id != user_id and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if 'perfil_photo' not in request.files:
        return jsonify({"error": "Arquivo não enviado"}), 400

    file = request.files['perfil_photo']

    if not file.content_type.startswith('image/'):
        return jsonify({"error": "Arquivo deve ser uma imagem"}), 400

    filename = f"{uuid.uuid4()}_{file.filename}"
    upload_dir = os.path.join("static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)

    user.perfil_photo = filepath  # Ou armazenar caminho relativo, se preferir
    db.session.commit()

    return jsonify({"message": "Foto de perfil atualizada com sucesso", "perfil_photo": filepath}), 200

# Deletar foto de perfil
@user_api.route("/api/users/<user_id>/perfil-photo", methods=["DELETE"])
@jwt_required()
def delete_profile_photo(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    if current_user.id != user_id and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if user.perfil_photo and os.path.exists(user.perfil_photo):
        try:
            os.remove(user.perfil_photo)
        except Exception as e:
            print(f"Erro ao remover arquivo da foto: {e}")

        user.perfil_photo = None
        db.session.commit()

    return jsonify({"message": "Foto de perfil removida com sucesso"}), 200

# Obter dados do usuário
@user_api.route("/api/users/<user_id>", methods=["GET"])
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

# Criar usuário
@user_api.route("/api/users", methods=["POST"])
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

    new_user = User(
        id=str(uuid.uuid4()),
        full_name=data["full_name"],
        username=data["username"],
        email=email,
        password=hashed_password,
        perfil_photo=perfil_path,
        payment_method=data.get("payment_method"),
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuário criado com sucesso", "id": new_user.id}), 201

# Atualizar usuário
@user_api.route("/api/users/<user_id>", methods=["PUT"])
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
@user_api.route("/api/users/<user_id>", methods=["DELETE"])
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

# Login
@user_api.route("/api/users/login", methods=["POST"])
@limiter.limit("5 per minute")
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
                "plan": user.plan,
                "tokens_available": user.tokens_available,
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
@user_api.route("/api/users/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    expires = 60 * 60 * 2  # 2 horas
    add_token_to_blacklist(jti, expires)
    return jsonify({"message": "Logout realizado com sucesso"}), 200

# Dados do usuário logado
@user_api.route("/api/users/me", methods=["GET"])
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