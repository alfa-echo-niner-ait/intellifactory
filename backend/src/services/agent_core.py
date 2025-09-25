# backend\src\services\agent_core.py

import json
from src.utils.api_client import query_model
from src.models import db, AgentDecision
from src.blueprints.events import push_event
from datetime import datetime

ALLOWED_ACTIONS = [
    "increase_speed",
    "reduce_speed",
    "schedule_maintenance",
    "reassign_job",
]

AGENT_PROMPTS = {
    "ProductionAgent": """You are a production scheduling agent.
- Allowed actions: increase_speed, reduce_speed, reassign_job, schedule_maintenance
- Focus on optimizing throughput, balancing machine load, and meeting order deadlines.
""",
    "EnergyAgent": """You are an energy optimization agent.
- Allowed actions: reduce_speed, schedule_maintenance
- Focus on minimizing energy costs while keeping production goals intact.
""",
    "QualityAgent": """You are a quality control agent.
- Allowed actions: schedule_maintenance, reduce_speed
- Focus on preventing quality issues by detecting risks in process parameters.
""",
    "MaintenanceAgent": """You are a maintenance planning agent.
- Allowed actions: schedule_maintenance
- Focus on scheduling preventive maintenance without disrupting critical orders.
""",
    "SupplyChainAgent": """You are a supply chain agent.
- Allowed actions: reassign_job
- Focus on managing order allocation and ensuring materials are available.
""",
}


def run_agent(agent_name: str, factory_state: dict):
    system_prompt = AGENT_PROMPTS.get(agent_name, "")
    prompt = f"{agent_name}: Analyze factory state.\n{json.dumps(factory_state)}\n"

    raw = query_model(prompt, agent_system_prompt=system_prompt)
    decision = _validate_and_parse(raw, agent_name)

    save_decision(agent_name, json.dumps(decision))

    return decision


def _validate_and_parse(raw: str, agent_name: str):
    try:
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
    try:
        db.session.add(d)
        db.session.commit()
        print(f"[>] Saved decision for {agent_name}")

        # Notify via SSE
        push_event(
            "decision",
            {
                "agent": agent_name,
                "decision": json.loads(decision_str),
                "created_at": d.created_at.isoformat(),
            },
        )
    except Exception as e:
        db.session.rollback()
        print(f"Error saving decision: {e}")
