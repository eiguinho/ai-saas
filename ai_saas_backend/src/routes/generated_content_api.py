from flask import Blueprint, request, jsonify, send_file
from extensions import db, jwt_required, get_jwt_identity
from models import (
    GeneratedContent,
    GeneratedTextContent,
    GeneratedImageContent,
    GeneratedVideoContent,
    User
)
import os

generated_content_api = Blueprint("generated_content_api", __name__)

@generated_content_api.before_request
def skip_jwt_for_options():
    if request.method == "OPTIONS":
        return "", 200

# Criar conteúdo gerado
@generated_content_api.route("/", methods=["POST"])
@jwt_required()
def create_generated_content():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Usuário inválido"}), 403

    data = request.get_json()
    content_type = data.get("content_type")  # text, image, video
    prompt = data.get("prompt")
    model_used = data.get("model_used")
    content_data = data.get("content_data")
    file_path = data.get("file_path")

    # atributos específicos
    temperature = data.get("temperature")
    style= data.get("style")
    ratio= data.get("ratio")
    duration = data.get("duration")

    # Validação
    if not content_type or not prompt or not model_used:
        return jsonify({
            "error": "Campos obrigatórios: content_type, prompt, model_used"
        }), 400

    if content_type == "text":
        generated = GeneratedTextContent(
            user_id=user.id,
            prompt=prompt,
            model_used=model_used,
            content_data=content_data,
            file_path=file_path,
            temperature=temperature
        )
    elif content_type == "image":
        generated = GeneratedImageContent(
            user_id=user.id,
            prompt=prompt,
            model_used=model_used,
            content_data=content_data,
            file_path=file_path,
            style=style,
            ratio=ratio
        )
    elif content_type == "video":
        generated = GeneratedVideoContent(
            user_id=user.id,
            prompt=prompt,
            model_used=model_used,
            content_data=content_data,
            file_path=file_path,
            style=style,
            ratio=ratio,
            duration=duration
        )
    else:
        return jsonify({"error": "Tipo inválido, use text, image ou video"}), 400

    db.session.add(generated)
    db.session.commit()

    return jsonify({
        "message": "Conteúdo gerado salvo",
        "content": generated.to_dict()
    }), 201


# LISTAR CONTEÚDOS DO USUÁRIO LOGADO
@generated_content_api.route("/", methods=["GET"])
@jwt_required()
def list_generated_contents():
    current_user_id = get_jwt_identity()
    query_param = request.args.get("q", "").strip().lower()

    base_query = GeneratedContent.query.filter_by(user_id=current_user_id)

    if query_param:
        base_query = base_query.filter(
            GeneratedContent.prompt.ilike(f"%{query_param}%")
        )

    contents = base_query.all()
    return jsonify([c.to_dict() for c in contents]), 200


# OBTER DETALHES DE UM CONTEÚDO ESPECÍFICO
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


# DELETAR CONTEÚDO GERADO
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

@generated_content_api.route("/batch", methods=["DELETE"])
@jwt_required()
def delete_batch_contents():
    current_user_id = get_jwt_identity()
    ids = request.json.get("ids", [])

    if not ids:
        return jsonify({"error": "Nenhum ID enviado"}), 400

    contents = GeneratedContent.query.filter(
        GeneratedContent.id.in_(ids),
        GeneratedContent.user_id == current_user_id
    ).all()

    if not contents:
        return jsonify({"error": "Nenhum conteúdo válido encontrado"}), 404

    for c in contents:
        db.session.delete(c)

    db.session.commit()
    return jsonify({"message": f"{len(contents)} conteúdos deletados com sucesso"}), 200

@generated_content_api.route("/images/<string:content_id>", methods=["GET"])
@jwt_required()
def get_generated_image(content_id):
    """
    Retorna a imagem gerada apenas se ela pertencer ao usuário logado.
    """
    current_user_id = get_jwt_identity()

    content = GeneratedImageContent.query.filter_by(id=content_id, user_id=current_user_id).first()

    if not content:
        return jsonify({"error": "Imagem não encontrada ou acesso negado"}), 404

    if not content.file_path or not os.path.exists(content.file_path):
        return jsonify({"error": "Arquivo da imagem não encontrado no servidor"}), 404

    return send_file(
        content.file_path,
        mimetype="image/png",
        as_attachment=False,
        download_name=os.path.basename(content.file_path)
    )

@generated_content_api.route("/videos/<string:content_id>", methods=["GET"])
@jwt_required()
def get_generated_video(content_id):
    """
    Retorna o vídeo gerado apenas se ele pertencer ao usuário logado.
    """
    current_user_id = get_jwt_identity()

    content = GeneratedVideoContent.query.filter_by(id=content_id, user_id=current_user_id).first()
    if not content:
        return jsonify({"error": "Vídeo não encontrado ou acesso negado"}), 404
    if not content.file_path or not os.path.exists(content.file_path):
        return jsonify({"error": "Arquivo do vídeo não encontrado no servidor"}), 404

    return send_file(
        content.file_path,
        mimetype="video/mp4",
        as_attachment=False,
        download_name=os.path.basename(content.file_path)
    )