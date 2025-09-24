from flask import Blueprint, jsonify
from src.models import Machine, Order, EnergyPrice, AgentDecision

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api")


@dashboard_bp.route("/machines", methods=["GET"])
def get_machines():
    machines = Machine.query.all()
    return jsonify(
        [
            {
                "id": m.id,
                "name": m.name,
                "status": m.status,
                "utilization": m.utilization,
                "energy_usage": m.energy_usage,
            }
            for m in machines
        ]
    )


@dashboard_bp.route("/orders", methods=["GET"])
def get_orders():
    orders = Order.query.all()
    return jsonify(
        [
            {
                "id": o.id,
                "customer": o.customer,
                "quantity": o.quantity,
                "deadline": o.deadline.isoformat(),
                "status": o.status,
            }
            for o in orders
        ]
    )


@dashboard_bp.route("/energy", methods=["GET"])
def get_energy_prices():
    prices = EnergyPrice.query.order_by(EnergyPrice.timestamp).all()
    return jsonify(
        [
            {"timestamp": e.timestamp.isoformat(), "price_per_kwh": e.price_per_kwh}
            for e in prices
        ]
    )


@dashboard_bp.route("/decisions", methods=["GET"])
def get_decisions():
    decisions = (
        AgentDecision.query.order_by(AgentDecision.created_at.desc()).limit(10).all()
    )
    return jsonify(
        [
            {
                "id": d.id,
                "agent_name": d.agent_name,
                "decision": d.decision,
                "impact": d.impact,
                "created_at": d.created_at.isoformat(),
            }
            for d in decisions
        ]
    )
