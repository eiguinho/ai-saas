from flask import Blueprint, request, jsonify, send_from_directory
from extensions import db, jwt_required, get_jwt_identity
from models import User
from dotenv import load_dotenv
import uuid, os

profile_api = Blueprint("profile_api", __name__)
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # pasta src
UPLOAD_DIR = os.path.join(BASE_DIR, "..", "static", "uploads")
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------- UPLOAD FOTO --------------------
@profile_api.route("/<user_id>/perfil-photo", methods=["PUT"])
@jwt_required()
def update_profile_photo(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    if str(current_user.id) != str(user_id) and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if 'perfil_photo' not in request.files:
        return jsonify({"error": "Arquivo não enviado"}), 400

    file = request.files['perfil_photo']
    if not file.content_type.startswith('image/'):
        return jsonify({"error": "Arquivo deve ser uma imagem"}), 400

    # Gera nome único e salva
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    file.save(filepath)

    # Remove foto anterior, se existir
    if user.perfil_photo:
        old_path = os.path.join(UPLOAD_DIR, user.perfil_photo)
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception as e:
                print(f"Erro ao remover arquivo antigo: {e}")

    user.perfil_photo = filename
    db.session.commit()

    return jsonify({
        "message": "Foto de perfil atualizada com sucesso",
        "perfil_photo_url": f"/api/profile/{user.id}/perfil-photo"
    }), 200

# -------------------- DELETE FOTO --------------------
@profile_api.route("/<user_id>/perfil-photo", methods=["DELETE"])
@jwt_required()
def delete_profile_photo(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    if str(current_user.id) != str(user_id) and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if user.perfil_photo:
        filepath = os.path.join(UPLOAD_DIR, user.perfil_photo)
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"Erro ao remover arquivo da foto: {e}")
        user.perfil_photo = None
        db.session.commit()

    return jsonify({"message": "Foto de perfil removida com sucesso"}), 200

# -------------------- GET FOTO PROTEGIDA --------------------
@profile_api.route("/<user_id>/perfil-photo", methods=["GET"])
@jwt_required()
def get_profile_photo(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"error": "Usuário inválido"}), 403

    # Só permite o próprio usuário ou admin
    if str(current_user.id) != str(user_id) and current_user.role != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    user = User.query.get(user_id)
    if not user or not user.perfil_photo:
        # Retorna imagem padrão se não houver foto
        default_path = os.path.join(UPLOAD_DIR, "default-profile.png")
        if os.path.exists(default_path):
            return send_from_directory(UPLOAD_DIR, "default-profile.png")
        return jsonify({"error": "Foto não encontrada"}), 404

    filepath = os.path.join(UPLOAD_DIR, user.perfil_photo)
    if not os.path.exists(filepath):
        # Se o arquivo foi deletado fisicamente, retorna padrão
        default_path = os.path.join(UPLOAD_DIR, "default-profile.png")
        if os.path.exists(default_path):
            return send_from_directory(UPLOAD_DIR, "default-profile.png")
        return jsonify({"error": "Arquivo não encontrado no servidor"}), 404

    # Envia arquivo de forma protegida
    return send_from_directory(UPLOAD_DIR, user.perfil_photo)
