# backend\src\services\simulation.py

from src.models import db, Machine, Order

def apply_actions(actions: list):
    updates = []
    for action in actions:
        machine = Machine.query.get(action["machine_id"])
        if not machine:
            continue

        if action["action"] == "increase_speed":
            machine.utilization = min(100, machine.utilization + action["value"])
        elif action["action"] == "reduce_speed":
            machine.utilization = max(0, machine.utilization - action["value"])
        elif action["action"] == "schedule_maintenance":
            machine.status = "maintenance"
        elif action["action"] == "reassign_job":
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
    return updates
