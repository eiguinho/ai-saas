import uuid
from datetime import datetime
from extensions import db
from models.associations import project_content_association

def generate_uuid():
    return str(uuid.uuid4())

class GeneratedContent(db.Model):
    __tablename__ = "generated_contents"

    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    
    content_type = db.Column(db.String(50), nullable=False)

    prompt = db.Column(db.Text, nullable=False)
    model_used = db.Column(db.String(100), nullable=False)
    content_data = db.Column(db.Text)
    file_path = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("generated_contents", lazy=True))
    projects = db.relationship(
        "Project",
        secondary=project_content_association,
        back_populates="contents"
    )

    __mapper_args__ = {
        "polymorphic_on": content_type,
        "polymorphic_identity": "base",
        "with_polymorphic": "*"
    }

    def __repr__(self):
        return f"<GeneratedContent {self.content_type}>"

    def base_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "content_type": self.content_type,
            "prompt": self.prompt,
            "model_used": self.model_used,
            "content_data": self.content_data,
            "file_path": self.file_path,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "projects": [p.id for p in self.projects]
        }

class GeneratedTextContent(GeneratedContent):
    __tablename__ = "generated_text_contents"
    
    id = db.Column(db.String, db.ForeignKey("generated_contents.id"), primary_key=True)
    temperatura = db.Column(db.Float)

    __mapper_args__ = {
        "polymorphic_identity": "text",
    }

    def to_dict(self):
        data = self.base_dict()
        data.update({"temperatura": self.temperatura})
        return data

class GeneratedImageContent(GeneratedContent):
    __tablename__ = "generated_image_contents"

    id = db.Column(db.String, db.ForeignKey("generated_contents.id"), primary_key=True)
    estilo = db.Column(db.String(50))
    proporcao = db.Column(db.String(20))

    __mapper_args__ = {
        "polymorphic_identity": "image",
    }

    def to_dict(self):
        data = self.base_dict()
        data.update({
            "estilo": self.estilo,
            "proporcao": self.proporcao
        })
        return data

class GeneratedVideoContent(GeneratedContent):
    __tablename__ = "generated_video_contents"

    id = db.Column(db.String, db.ForeignKey("generated_contents.id"), primary_key=True)
    estilo = db.Column(db.String(50))
    proporcao = db.Column(db.String(20))
    duracao = db.Column(db.Integer)  # em segundos

    __mapper_args__ = {
        "polymorphic_identity": "video",
    }

    def to_dict(self):
        data = self.base_dict()
        data.update({
            "estilo": self.estilo,
            "proporcao": self.proporcao,
            "duracao": self.duracao
        })
        return data