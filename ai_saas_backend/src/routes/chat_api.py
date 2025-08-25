from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.chat import Chat, ChatMessage, ChatAttachment
from datetime import datetime
from sqlalchemy.orm import joinedload
import os

chat_api = Blueprint("chat_api", __name__)

@chat_api.before_request
def skip_jwt_for_options():
    if request.method == "OPTIONS":
        return "", 200

@chat_api.route("/", methods=["POST"])
@jwt_required()
def create_chat():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        title = data.get("title", "Novo Chat")

        chat = Chat(user_id=user_id, title=title, created_at=datetime.utcnow())
        db.session.add(chat)
        db.session.commit()

        return jsonify(chat.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@chat_api.route("/", methods=["GET"])
@jwt_required()
def list_chats():
    try:
        user_id = get_jwt_identity()
        q = request.args.get("q", "").strip()

        # Query base
        query = Chat.query.options(joinedload(Chat.messages)).filter_by(user_id=user_id)

        if q:
            query = query.outerjoin(ChatMessage).filter(
                (Chat.title.ilike(f"%{q}%")) |
                (ChatMessage.content.ilike(f"%{q}%"))
            )

        chats = query.order_by(Chat.created_at.desc()).all()

        chat_list = []
        chat_list = []
        for c in chats:
            chat_dict = c.to_dict(with_messages=True)
            snippet = None
            if q:
                for m in c.messages:
                    if m.content and q.lower() in m.content.lower():
                        snippet = (m.content[:100] + "...") if len(m.content) > 100 else m.content
                        break
            chat_dict["snippet"] = snippet
            chat_list.append(chat_dict)


        return jsonify(chat_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_api.route("/<string:chat_id>", methods=["GET"])
@jwt_required()
def get_chat(chat_id):
    try:
        user_id = get_jwt_identity()
        chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()
        if not chat:
            return jsonify({"error": "Chat não encontrado"}), 404
        return jsonify(chat.to_dict(with_messages=True))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_api.route("/<string:chat_id>", methods=["PUT"])
@jwt_required()
def update_chat(chat_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()
        if not chat:
            return jsonify({"error": "Chat não encontrado"}), 404

        chat.title = data.get("title", chat.title)
        chat.system_prompt = data.get("system_prompt", chat.system_prompt)
        chat.default_model = data.get("default_model", chat.default_model)
        db.session.commit()
        return jsonify(chat.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@chat_api.route("/<string:chat_id>/archive", methods=["PATCH"])
@jwt_required()
def archive_chat(chat_id):
    try:
        user_id = get_jwt_identity()
        chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()
        if not chat:
            return jsonify({"error": "Chat não encontrado"}), 404
        chat.archived = True
        db.session.commit()
        return jsonify({"message": "Chat arquivado"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@chat_api.route("/<string:chat_id>/unarchive", methods=["PATCH"])
@jwt_required()
def unarchive_chat(chat_id):
    try:
        user_id = get_jwt_identity()
        chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()
        if not chat:
            return jsonify({"error": "Chat não encontrado"}), 404
        chat.archived = False
        db.session.commit()
        return jsonify({"message": "Chat desarquivado"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@chat_api.route("/<string:chat_id>", methods=["DELETE"])
@jwt_required()
def delete_chat(chat_id):
    try:
        user_id = get_jwt_identity()
        chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()
        if not chat:
            return jsonify({"error": "Chat não encontrado"}), 404
        db.session.delete(chat)
        db.session.commit()
        return jsonify({"message": "Chat deletado com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@chat_api.route("/attachments/<string:attachment_id>", methods=["GET"])
@jwt_required()
def get_attachment(attachment_id):
    """
    Retorna o arquivo do chat apenas para o usuário dono do chat.
    """
    user_id = get_jwt_identity()

    # Busca attachment garantindo que pertence a um chat do usuário
    attachment = ChatAttachment.query.join(ChatMessage).join(Chat).filter(
        ChatAttachment.id == attachment_id,
        Chat.user_id == user_id
    ).first()

    if not attachment:
        return jsonify({"error": "Arquivo não encontrado ou acesso negado"}), 404

    if not os.path.exists(attachment.path):
        return jsonify({"error": "Arquivo não encontrado no servidor"}), 404

    return send_file(
        attachment.path,
        mimetype=attachment.mimetype,
        as_attachment=False,
        download_name=attachment.name
    )
