from flask import Blueprint, jsonify
from src.services.agent_core import run_agent
from src.services.simulation import apply_actions
from src.utils.build_state import build_factory_state
from flask import request
from src.blueprints.events import push_event

agents_bp = Blueprint("agents", __name__, url_prefix="/api/agents")


@agents_bp.route("/production", methods=["POST"])
def run_production():
    state = build_factory_state()
    print("[>] Running Production Agent")
    result = run_agent("ProductionAgent", state)
    updates = apply_actions(result.get("actions", []))
    return jsonify({"agent": "ProductionAgent", "decision": result, "updates": updates})


@agents_bp.route("/energy", methods=["POST"])
def run_energy():
    state = build_factory_state()
    result = run_agent("EnergyAgent", state)
    updates = apply_actions(result.get("actions", []))
    return jsonify({"agent": "EnergyAgent", "decision": result, "updates": updates})


@agents_bp.route("/quality", methods=["POST"])
def run_quality():
    state = build_factory_state()
    result = run_agent("QualityAgent", state)
    updates = apply_actions(result.get("actions", []))
    return jsonify({"agent": "QualityAgent", "decision": result, "updates": updates})


@agents_bp.route("/maintenance", methods=["POST"])
def run_maintenance():
    state = build_factory_state()
    result = run_agent("MaintenanceAgent", state)
    updates = apply_actions(result.get("actions", []))
    return jsonify(
        {"agent": "MaintenanceAgent", "decision": result, "updates": updates}
    )


@agents_bp.route("/supply", methods=["POST"])
def run_supply():
    state = build_factory_state()
    result = run_agent("SupplyChainAgent", state)
    updates = apply_actions(result.get("actions", []))
    return jsonify(
        {"agent": "SupplyChainAgent", "decision": result, "updates": updates}
    )


# New: request agent suggestions without applying them
@agents_bp.route("/suggest/<agent_name>", methods=["POST"])
def suggest_agent(agent_name):
    state = build_factory_state()
    result = run_agent(agent_name, state)
    # don't apply actions, just return the suggested actions
    return jsonify({"agent": agent_name, "decision": result})


# New: apply a list of actions (POST from frontend after user accepts suggestions)
@agents_bp.route("/apply_actions", methods=["POST"])
def apply_actions_endpoint():
    payload = request.get_json() or {}
    actions = payload.get("actions", [])
    updates = apply_actions(actions)

    # broadcast updates
    for u in updates:
        push_event("machine_update", u)

    return jsonify({"updates": updates})


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

    # Apply actions from all agents
    updates = []
    for res in results.values():
        updates += apply_actions(res.get("actions", []))

    return jsonify({"agents": results, "updates": updates})
