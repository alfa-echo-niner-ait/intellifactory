# backend\src\services\simulation.py

from src.models import db, Machine, Order
from src.blueprints.events import push_event


def apply_actions(actions: list):
    """Apply agent actions to machines/orders and persist to DB."""
    updates = []
    for action in actions:
        # Coerce machine_id to int when possible so string IDs from agents still match DB ids
        raw_mid = action.get("machine_id")
        machine = None
        if raw_mid is not None:
            try:
                mid = int(raw_mid)
            except Exception:
                mid = raw_mid
            machine = Machine.query.get(mid)
        else:
            machine = None
        if not machine:
            print(f"[!] apply_actions: no machine found for action {action}. (machine_id={raw_mid})")
            continue

        act = action.get("action")
        value = action.get("value")

        if act == "increase_speed":
            try:
                val = float(value)
            except:
                val = 0
            machine.utilization = min(100, machine.utilization + val)

        elif act == "reduce_speed":
            try:
                val = float(value)
            except:
                val = 0
            machine.utilization = max(0, machine.utilization - val)

        elif act == "schedule_maintenance":
            machine.status = "maintenance"

        elif act == "reassign_job":
            order = Order.query.first()
            if order:
                order.status = "in_progress"

        updates.append(
            {
                "machine_id": machine.id,
                "new_status": machine.status,
                "new_utilization": machine.utilization,
            }
        )

    db.session.commit()
    # Broadcast state update
    if len(updates) == 0:
        print(f"[!] apply_actions: no updates produced from actions: {actions}")
    else:
        print(f"[>] Broadcasting state update: {updates}")
    push_event("state_update", updates)
    
    return updates
