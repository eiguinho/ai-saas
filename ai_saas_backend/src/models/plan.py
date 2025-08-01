from datetime import datetime
from extensions import db

class Plan(db.Model):
    __tablename__ = "plans"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    price = db.Column(db.Float, default=0.0)
    tokens_available = db.Column(db.Integer, default=0)
    users = db.relationship("User", back_populates="plan", lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)