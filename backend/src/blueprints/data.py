# backend\src\blueprints\data.py

from flask import Blueprint, jsonify
from src.models import Machine, Order, EnergyPrice, AgentDecision

data_bp = Blueprint("data", __name__, url_prefix="/api/data")


@data_bp.route("/machines", methods=["GET"])
def get_machines():
    machines = [
        {
            "id": m.id,
            "name": m.name,
            "status": m.status,
            "utilization": m.utilization,
            "energy_usage": m.energy_usage,
        }
        for m in Machine.query.all()
    ]
    return jsonify(machines)


@data_bp.route("/orders", methods=["GET"])
def get_orders():
    orders = [
        {
            "id": o.id,
            "customer": o.customer,
            "quantity": o.quantity,
            "deadline": o.deadline.isoformat(),
            "status": o.status,
        }
        for o in Order.query.all()
    ]
    return jsonify(orders)


@data_bp.route("/energy", methods=["GET"])
def get_energy():
    prices = [
        {"timestamp": e.timestamp.isoformat(), "price_per_kwh": e.price_per_kwh}
        for e in EnergyPrice.query.all()
    ]
    return jsonify(prices)


@data_bp.route("/decisions", methods=["GET"])
def get_decisions():
    decisions = [
        {
            "id": d.id,
            "agent": d.agent_name,
            "decision": d.decision,
            "created_at": d.created_at.isoformat(),
        }
        for d in AgentDecision.query.order_by(AgentDecision.created_at.desc()).limit(20)
    ]
    return jsonify(decisions)
