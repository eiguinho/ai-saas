from flask import Blueprint, request, jsonify
from extensions import db, jwt_required, get_jwt_identity
from models import GeneratedContent, User

generated_content_api = Blueprint("generated_content_api", __name__)

# Criar conteúdo gerado
@generated_content_api.route("/", methods=["POST"])
@jwt_required()
def create_generated_content():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Usuário inválido"}), 403

    data = request.get_json()
    content_type = data.get("content_type")
    prompt = data.get("prompt")
    model_used = data.get("model_used")
    content_data = data.get("content_data")
    file_path = data.get("file_path")

    if not content_type or not prompt or not model_used:
        return jsonify({"error": "Campos obrigatórios: content_type, prompt, model_used"}), 400

    generated = GeneratedContent(
        user_id=user.id,
        content_type=content_type,
        prompt=prompt,
        model_used=model_used,
        content_data=content_data,
        file_path=file_path
    )

    db.session.add(generated)
    db.session.commit()

    return jsonify({"message": "Conteúdo gerado salvo", "content": generated.to_dict()}), 201


# Listar conteúdos do usuário logado
@generated_content_api.route("/", methods=["GET"])
@jwt_required()
def list_generated_contents():
    current_user_id = get_jwt_identity()
    contents = GeneratedContent.query.filter_by(user_id=current_user_id).all()
    return jsonify([c.to_dict() for c in contents]), 200


# Obter detalhes de um conteúdo
@generated_content_api.route("/<content_id>", methods=["GET"])
@jwt_required()
def get_generated_content(content_id):
    current_user_id = get_jwt_identity()
    content = GeneratedContent.query.get(content_id)

    if not content:
        return jsonify({"error": "Conteúdo não encontrado"}), 404
    if content.user_id != current_user_id:
        return jsonify({"error": "Acesso negado"}), 403

    return jsonify(content.to_dict()), 200


# Deletar conteúdo
@generated_content_api.route("/<content_id>", methods=["DELETE"])
@jwt_required()
def delete_generated_content(content_id):
    current_user_id = get_jwt_identity()
    content = GeneratedContent.query.get(content_id)

    if not content:
        return jsonify({"error": "Conteúdo não encontrado"}), 404
    if content.user_id != current_user_id:
        return jsonify({"error": "Acesso negado"}), 403

    db.session.delete(content)
    db.session.commit()
    return jsonify({"message": "Conteúdo deletado com sucesso"}), 200