import uuid
from datetime import datetime
from enum import Enum
from extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class SenderType(str, Enum):
    USER = "user"
    AI = "assistant"
    SYSTEM = "system"
    TOOL = "tool"

class Chat(db.Model):
    __tablename__ = "chats"

    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(180), nullable=True)
    system_prompt = db.Column(db.Text, nullable=True)
    default_model = db.Column(db.String(120), nullable=True)
    provider = db.Column(db.String(50), nullable=True)
    archived = db.Column(db.Boolean, default=False)
    supports_vision = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = db.relationship(
        "ChatMessage",
        back_populates="chat",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at.asc()",
        lazy=True,
    )
    user = db.relationship("User", backref=db.backref("chats", lazy=True))

    def __repr__(self):
        return f"<Chat {self.id} title={self.title!r}>"

    def to_dict(self, with_messages: bool = False, msg_limit: int | None = None):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "system_prompt": self.system_prompt,
            "default_model": self.default_model,
            "provider": self.provider,
            "archived": self.archived,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if with_messages:
            msgs = self.messages
            if msg_limit is not None:
                msgs = msgs[-msg_limit:]
            data["messages"] = [m.to_dict() for m in msgs]
        return data

class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    chat_id = db.Column(db.String, db.ForeignKey("chats.id"), nullable=False, index=True)
    user_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=True, index=True)
    role = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False, default="")
    model_used = db.Column(db.String(120), nullable=True)
    provider = db.Column(db.String(50), nullable=True)
    temperature = db.Column(db.Float, nullable=True)
    max_tokens = db.Column(db.Integer, nullable=True)
    prompt_tokens = db.Column(db.Integer, nullable=True)
    completion_tokens = db.Column(db.Integer, nullable=True)
    total_tokens = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    chat = db.relationship("Chat", back_populates="messages")
    user = db.relationship("User")
    attachments = db.relationship(
        "ChatAttachment",
        back_populates="message",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def __repr__(self):
        return f"<ChatMessage {self.id} role={self.role}>"

    def to_dict(self):
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "user_id": self.user_id,
            "role": self.role,
            "content": self.content,
            "model_used": self.model_used,
            "provider": self.provider,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "usage": {
                "prompt_tokens": self.prompt_tokens,
                "completion_tokens": self.completion_tokens,
                "total_tokens": self.total_tokens,
            },
            "attachments": [a.to_dict() for a in (self.attachments or [])],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class ChatAttachment(db.Model):
    __tablename__ = "chat_attachments"

    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    message_id = db.Column(db.String, db.ForeignKey("chat_messages.id"), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    path = db.Column(db.String(600), nullable=False)
    mimetype = db.Column(db.String(120), nullable=False, default="application/octet-stream")
    size_bytes = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    message = db.relationship("ChatMessage", back_populates="attachments")

    def __repr__(self):
        return f"<ChatAttachment {self.id} name={self.name!r}>"

    def to_dict(self):
        return {
            "id": self.id,
            "message_id": self.message_id,
            "name": self.name,
            "mimetype": self.mimetype,
            "size_bytes": self.size_bytes,
            "url": f"/api/chats/attachments/{self.id}",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
