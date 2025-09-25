# backend\src\utils\build_prompt.py

from src.models import Machine, Order, EnergyPrice

def build_factory_state():
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

    prices = [
        {"timestamp": e.timestamp.isoformat(), "price_per_kwh": e.price_per_kwh}
        for e in EnergyPrice.query.all()
    ]

    return {
        "machines": machines,
        "orders": orders,
        "energy_prices": prices,
        "context": "Optimization run",
    }
