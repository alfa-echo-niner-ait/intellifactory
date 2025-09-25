# backend\src\blueprints\agents.py

from flask import Blueprint, jsonify
from src.services.agent_core import run_agent
from src.services.simulation import apply_actions
from src.utils.build_state import build_factory_state

agents_bp = Blueprint("agents", __name__, url_prefix="/api/agents")


@agents_bp.route("/production", methods=["POST"])
def run_production():
    state = build_factory_state()
    return jsonify(run_agent("ProductionAgent", state))


@agents_bp.route("/energy", methods=["POST"])
def run_energy():
    state = build_factory_state()
    return jsonify(run_agent("EnergyAgent", state))


@agents_bp.route("/quality", methods=["POST"])
def run_quality():
    state = build_factory_state()
    return jsonify(run_agent("QualityAgent", state))


@agents_bp.route("/maintenance", methods=["POST"])
def run_maintenance():
    state = build_factory_state()
    return jsonify(run_agent("MaintenanceAgent", state))


@agents_bp.route("/supply", methods=["POST"])
def run_supply():
    state = build_factory_state()
    return jsonify(run_agent("SupplyChainAgent", state))


# Combined endpoint to run all agents and apply their actions
@agents_bp.route("/run_all", methods=["POST"])
def run_all():
    state = build_factory_state()
    results = {
        "production_agent": run_agent("ProductionAgent", state),
        "energy_agent": run_agent("EnergyAgent", state),
        "quality_agent": run_agent("QualityAgent", state),
        "maintenance_agent": run_agent("MaintenanceAgent", state),
        "supply_agent": run_agent("SupplyChainAgent", state),
    }

    # Apply actions
    updates = []
    for res in results.values():
        updates += apply_actions(res.get("actions", []))

    return jsonify({"agents": results, "updates": updates})
