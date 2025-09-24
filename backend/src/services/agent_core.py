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

PROMPT_SUFFIX = (
    "You are a specialized factory agent. "
    "ONLY respond in **valid JSON** matching:\n"
    "{\n"
    '  "actions": [{"machine_id": int, "action": string, "value": number}],\n'
    '  "impact": {"throughput_change_percent": number, "energy_change_percent": number, "notes": string}\n'
    "}\n"
    f"- Allowed machine status values: idle, running, maintenance.\n"
    f"- Allowed actions: {ALLOWED_ACTIONS}.\n"
    "Do NOT include explanations or extra text outside JSON.\n"
    "If you cannot decide, return empty actions with impact notes."
)


def run_production_agent(factory_state: dict):
    prompt = (
        "ProductionAgent: Analyze factory state for production optimization.\n"
        f"{json.dumps(factory_state)}\n"
        f"{PROMPT_SUFFIX}"
    )
    return _run_agent(prompt, "ProductionAgent")


def run_energy_agent(factory_state: dict):
    prompt = (
        "EnergyAgent: Analyze energy usage and suggest cost-saving strategies.\n"
        f"{json.dumps(factory_state)}\n"
        f"{PROMPT_SUFFIX}"
    )
    return _run_agent(prompt, "EnergyAgent")


def _run_agent(prompt: str, agent_name: str):
    raw = query_model(prompt)
    decision = _validate_and_parse(raw, agent_name)
    save_decision(agent_name, json.dumps(decision))
    return decision


def _validate_and_parse(raw: str, agent_name: str):
    try:
        data = json.loads(raw)
        # Basic checks
        if "actions" not in data or "impact" not in data:
            raise ValueError("Missing keys.")
        for a in data["actions"]:
            if a.get("action") not in ALLOWED_ACTIONS:
                raise ValueError(f"Invalid action {a.get('action')}")
        return data
    except Exception as e:
        return {
            "actions": [],
            "impact": {
                "throughput_change_percent": 0,
                "energy_change_percent": 0,
                "notes": f"{agent_name} returned invalid JSON: {e}. Raw: {raw}",
            },
        }


def save_decision(agent_name, decision_json):
    d = AgentDecision(
        agent_name=agent_name,
        decision=decision_json,
        impact="parsed",
        created_at=datetime.utcnow(),
    )
    db.session.add(d)
    db.session.commit()
