from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.notification import Notification
from models.user import User

notification_api = Blueprint("notification_api", __name__)

# Criar uma notificação (usado internamente quando gerar imagem, enviar código, etc.)
@notification_api.route("/", methods=["POST"])
@jwt_required()
def create_notification():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    message = data.get("message")
    link = data.get("link")

    if not message:
        return jsonify({"error": "Mensagem obrigatória"}), 400

    notif = Notification(
        user_id=current_user_id,
        message=message,
        link=link
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({"notification": notif.to_dict()}), 201

# Listar notificações (limite 8 para o Header)
@notification_api.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()
    limit = int(request.args.get("limit", 8))

    notifs = (
        Notification.query.filter_by(user_id=current_user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )

    return jsonify({"notifications": [n.to_dict() for n in notifs]}), 200

# Marcar todas como lidas
@notification_api.route("/mark-read", methods=["PATCH"])
@jwt_required()
def mark_notifications_read():
    current_user_id = get_jwt_identity()

    Notification.query.filter_by(user_id=current_user_id, is_read=False).update(
        {"is_read": True}
    )
    db.session.commit()

    return jsonify({"message": "Notificações marcadas como lidas"}), 200

# Marcar notificação específica como lida
@notification_api.route("/<notif_id>/mark-read", methods=["PATCH"])
@jwt_required()
def mark_single_notification_read(notif_id):
    current_user_id = get_jwt_identity()

    notif = Notification.query.filter_by(id=notif_id, user_id=current_user_id).first()
    if not notif:
        return jsonify({"error": "Notificação não encontrada"}), 404

    notif.is_read = True
    db.session.commit()

    return jsonify({"message": "Notificação marcada como lida"}), 200

# Deletar notificação
@notification_api.route("/<notif_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notif_id):
    current_user_id = get_jwt_identity()

    notif = Notification.query.filter_by(id=notif_id, user_id=current_user_id).first()
    if not notif:
        return jsonify({"error": "Notificação não encontrada"}), 404

    db.session.delete(notif)
    db.session.commit()

    return jsonify({"message": "Notificação excluída"}), 200