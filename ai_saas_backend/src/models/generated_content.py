import uuid
from datetime import datetime
from extensions import db
from models.associations import project_content_association

def generate_uuid():
    return str(uuid.uuid4())

class GeneratedContent(db.Model):
    __tablename__ = "generated_contents"
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)

    # Dados do conteúdo gerado
    content_type = db.Column(db.String(50), nullable=False)  # 'text', 'image', 'video'
    prompt = db.Column(db.Text, nullable=False)
    model_used = db.Column(db.String(100), nullable=False)
    content_data = db.Column(db.Text)  # JSON com resposta da IA
    file_path = db.Column(db.String(500))  # caminho do arquivo salvo
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamentos
    user = db.relationship("User", backref=db.backref("generated_contents", lazy=True))
    projects = db.relationship(
        "Project",
        secondary=project_content_association,
        back_populates="contents"
    )

    def __repr__(self):
        return f"<GeneratedContent {self.content_type}>"

    def to_dict(self):
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