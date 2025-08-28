from flask import Blueprint, jsonify, request
from extensions import db, bcrypt, jwt_required
from utils import admin_required
from models import User, Plan
import uuid, os, re

admin_api = Blueprint("admin_api", __name__)

@admin_api.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def list_all_users():
    users = User.query.all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "plan": {
                "id": user.plan.id,
                "name": user.plan.name
            } if user.plan else None,
            "is_active": user.is_active
        })
    return jsonify(result)

@admin_api.route("/users", methods=["POST"])
@jwt_required()
@admin_required
def create_user():
    data = request.form
    file = request.files.get("perfil_photo")

    def is_valid_email(email):
        return re.match(r"[^@]+@[^@]+\.[^@]+", email)

    if not is_valid_email(data.get("email", "")):
        return jsonify({"error": "Email inválido"}), 400

    required_fields = ["full_name", "username", "email", "password", "plan_id"]
    for field in required_fields:
        if not data.get(field):
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

    plan = Plan.query.get(data["plan_id"])
    if not plan:
        return jsonify({"error": "Plano inválido"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        id=str(uuid.uuid4()),
        full_name=data["full_name"],
        username=data["username"],
        email=data["email"],
        password=hashed_password,
        perfil_photo=perfil_path,
        #payment_method=data.get("payment_method"),
        plan=plan,
        role=data.get("role", "user")
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuário criado com sucesso", "id": new_user.id}), 201


@admin_api.route("/users/<user_id>/plan", methods=["PUT"])
@jwt_required()
@admin_required
def update_user_plan(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    data = request.get_json()
    if not data or "plan_id" not in data:
        return jsonify({"error": "plan_id obrigatório"}), 400

    plan = Plan.query.get(data["plan_id"])
    if not plan:
        return jsonify({"error": "Plano inválido"}), 404

    user.plan = plan
    db.session.commit()
    return jsonify({
        "message": "Plano atualizado com sucesso",
        "user": {
            "id": user.id,
            "plan": user.plan.name
        }
    }), 200

# Atualização de role comentada, mas is_active continua funcionando
@admin_api.route("/users/<user_id>/status", methods=["PUT"])
@jwt_required()
@admin_required
def update_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON vazio"}), 400

    # if "role" in data:
    #     user.role = data["role"]

    if "is_active" in data:
        user.is_active = data["is_active"]

    db.session.commit()
    return jsonify({
        "message": "Usuário atualizado com sucesso",
        "user": {
            "id": user.id,
            "is_active": user.is_active
        }
    }), 200
