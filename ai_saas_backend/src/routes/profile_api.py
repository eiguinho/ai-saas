from flask import Blueprint, request, jsonify
from extensions import (
    db, jwt_required, get_jwt_identity
)
from models import User
from dotenv import load_dotenv
import uuid, os

profile_api = Blueprint("profile_api", __name__)

load_dotenv()

# Atualizar foto de perfil
@profile_api.route("/<user_id>/perfil-photo", methods=["PUT"])
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

    user.perfil_photo = filepath  # pode salvar caminho relativo, se preferir
    db.session.commit()

    return jsonify({
        "message": "Foto de perfil atualizada com sucesso",
        "perfil_photo": filepath
    }), 200

# Deletar foto de perfil
@profile_api.route("/<user_id>/perfil-photo", methods=["DELETE"])
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