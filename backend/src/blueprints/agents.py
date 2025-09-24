from flask import Blueprint, jsonify
from src.services.agent_core import run_production_agent, run_energy_agent
from src.utils.build_prompt import build_factory_state

agents_bp = Blueprint("agents", __name__, url_prefix="/api/agents")


@agents_bp.route("/run", methods=["POST"])
def run_agents():
    factory_state = build_factory_state()
    prod_decision = run_production_agent(factory_state)
    energy_decision = run_energy_agent(factory_state)
    return jsonify({"production_agent": prod_decision, "energy_agent": energy_decision})
