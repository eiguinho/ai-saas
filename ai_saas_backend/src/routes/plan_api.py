from flask import Blueprint, jsonify
from models import Plan

plan_api = Blueprint("plan_api", __name__)

@plan_api.route("/", methods=["GET"])
def get_plans():
    plans = Plan.query.all()
    return jsonify([
        {
            "id": plan.id,
            "name": plan.name,
            "features": [
                {
                    "key": pf.feature.key,
                    "description": pf.feature.description,
                    "value": pf.value
                }
                for pf in plan.features
            ],
            "created_at": plan.created_at.isoformat()
        }
        for plan in plans
    ])
