from datetime import datetime
from extensions import db

class Plan(db.Model):
    __tablename__ = "plans"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    users = db.relationship("User", back_populates="plan", lazy=True)
    features = db.relationship("PlanFeature", back_populates="plan", cascade="all, delete-orphan")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Feature(db.Model):
    __tablename__ = "features"
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    plans = db.relationship("PlanFeature", back_populates="feature", cascade="all, delete-orphan")


class PlanFeature(db.Model):
    __tablename__ = "plan_features"
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("plans.id"), nullable=False)
    feature_id = db.Column(db.Integer, db.ForeignKey("features.id"), nullable=False)
    value = db.Column(db.String(100), nullable=False, default="false")  # pode ser "true", "false", "10", "1000" etc
    plan = db.relationship("Plan", back_populates="features")
    feature = db.relationship("Feature", back_populates="plans")
