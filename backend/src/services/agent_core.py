# backend\src\services\agent_core.py
import json
from src.utils.api_client import query_model
from src.models import db, AgentDecision
from datetime import datetime

ALLOWED_ACTIONS = [
    "increase_speed",
    "reduce_speed",
    "schedule_maintenance",
    "reassign_job",
]


def run_production_agent(factory_state: dict):
    prompt = (
        "ProductionAgent: Analyze factory state for production optimization.\n"
        f"{json.dumps(factory_state)}\n"
    )
    return _run_agent(prompt, "ProductionAgent")


def run_energy_agent(factory_state: dict):
    prompt = (
        "EnergyAgent: Analyze energy usage and suggest cost-saving strategies.\n"
        f"{json.dumps(factory_state)}\n"
    )
    return _run_agent(prompt, "EnergyAgent")


def _run_agent(prompt: str, agent_name: str):
    raw = query_model(prompt)
    decision = _validate_and_parse(raw, agent_name)
    save_decision(agent_name, json.dumps(decision))
    return decision


def _validate_and_parse(raw: str, agent_name: str):
    try:
        print(f"{agent_name} raw response:", raw)

        if isinstance(raw, dict):
            res_data = raw
        else:
            res_data = json.loads(raw)

        # Basic checks
        if "actions" not in res_data or "impact" not in res_data:
            raise ValueError("Missing keys.")
        for a in res_data["actions"]:
            if a.get("action") not in ALLOWED_ACTIONS:
                raise ValueError(f"Invalid action {a.get('action')}")
        return res_data
    except Exception as e:
        # Handle both string and dict raw responses
        if isinstance(raw, dict):
            raw_response = raw
        else:
            try:
                raw_response = json.loads(raw)
            except:
                raw_response = {"raw_string": raw}

        return {
            "actions": [],
            "impact": {
                "throughput_change_percent": 0,
                "energy_change_percent": 0,
                "notes": f"{agent_name} returned invalid JSON: {e}",
            },
            "raw_response": raw_response,
        }


def save_decision(agent_name, decision_json):
    # Convert dict to string if necessary
    if isinstance(decision_json, dict):
        decision_str = json.dumps(decision_json)
    else:
        decision_str = decision_json

    d = AgentDecision(
        agent_name=agent_name,
        decision=decision_str,
        impact="parsed",
        created_at=datetime.utcnow(),
    )
    db.session.add(d)
    db.session.commit()
