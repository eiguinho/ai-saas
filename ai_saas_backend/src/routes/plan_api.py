from flask import Blueprint, jsonify
from models import Plan

plan_api = Blueprint("plan_api", __name__)

@plan_api.route("/api/plans", methods=["GET"])
def get_plans():
    plans = Plan.query.all()
    return jsonify([{
        "id": plan.id,
        "name": plan.name,
        "price": plan.price,
        "tokens_available": plan.tokens_available,
        "created_at": plan.created_at.isoformat()
    } for plan in plans])
