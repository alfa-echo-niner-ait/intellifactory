# backend\src\services\simulation.py

from src.models import db, Machine, Order
from src.blueprints.events import push_event


def apply_actions(actions: list):
    """Apply agent actions to machines/orders and persist to DB."""
    updates = []
    for action in actions:
        machine = Machine.query.get(action.get("machine_id"))
        if not machine:
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
    push_event("state_update", updates)
    
    return updates
