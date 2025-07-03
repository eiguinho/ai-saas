from datetime import datetime
from models.db import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(30), nullable=False, unique=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    plan = db.Column(db.String, default="free")
    tokens_available = db.Column(db.Integer, default=1000)
    payment_method = db.Column(db.String, nullable=True)
    perfil_photo = db.Column(db.String, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    address = db.relationship("Address", uselist=False, back_populates="user")


class Address(db.Model):
    __tablename__ = "addresses"

    id = db.Column(db.String, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    street = db.Column(db.String, nullable=False)
    number = db.Column(db.String, nullable=False)
    zip_code = db.Column(db.String, nullable=False)

    user = db.relationship("User", back_populates="address")