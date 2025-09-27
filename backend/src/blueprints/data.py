# backend\src\blueprints\data.py

from flask import Blueprint, jsonify, request
from src.models import Machine, Order, EnergyPrice, AgentDecision
from src.models import db
from src.blueprints.events import push_event

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


@data_bp.route("/machines/<int:machine_id>", methods=["PUT"])
def update_machine(machine_id):
    """Update machine record in DB and broadcast via SSE"""
    payload = request.get_json() or {}
    m = Machine.query.get_or_404(machine_id)

    # allowed fields to update
    if "status" in payload:
        m.status = payload["status"]
    if "utilization" in payload:
        try:
            m.utilization = float(payload["utilization"])
        except Exception:
            pass
    if "name" in payload:
        m.name = payload["name"]
    if "energy_usage" in payload:
        try:
            m.energy_usage = float(payload["energy_usage"])
        except Exception:
            pass

    db.session.add(m)
    db.session.commit()

    # broadcast event to SSE clients
    push_event("machine_update", {"machine_id": m.id, "new_status": m.status, "new_utilization": m.utilization})

    return jsonify({
        "id": m.id,
        "name": m.name,
        "status": m.status,
        "utilization": m.utilization,
        "energy_usage": m.energy_usage,
    })
