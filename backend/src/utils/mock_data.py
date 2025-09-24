from src.models import db, Machine, Order, EnergyPrice
from datetime import datetime, timedelta


def seed_data(app, drop_first=False):
    """Seed database with dummy data."""
    if drop_first:
        db.drop_all()
    db.create_all()

    # Clear tables without dropping schema
    Machine.query.delete()
    Order.query.delete()
    EnergyPrice.query.delete()

    machines = [
        Machine(
            name="CNC Lathe", status="running", utilization=75.3, energy_usage=12.5
        ),
        Machine(
            name="Milling Machine", status="idle", utilization=30.0, energy_usage=4.2
        ),
        Machine(
            name="3D Printer", status="running", utilization=60.0, energy_usage=8.1
        ),
        Machine(
            name="Assembly Robot",
            status="maintenance",
            utilization=0.0,
            energy_usage=0.0,
        ),
    ]
    db.session.add_all(machines)

    orders = [
        Order(
            customer="Alpha Corp",
            quantity=500,
            deadline=datetime.utcnow() + timedelta(days=2),
        ),
        Order(
            customer="Beta Ltd",
            quantity=200,
            deadline=datetime.utcnow() + timedelta(hours=24),
        ),
    ]
    db.session.add_all(orders)

    now = datetime.utcnow()
    for i in range(12):
        price = 0.10 if i not in (6, 7, 8) else 0.25
        db.session.add(
            EnergyPrice(timestamp=now - timedelta(hours=i), price_per_kwh=price)
        )

    db.session.commit()
    print("✅ Dummy data seeded.")
