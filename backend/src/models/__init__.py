from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Machine(db.Model):
    __tablename__ = "machines"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="idle")  # idle, running, maintenance
    utilization = db.Column(db.Float, default=0.0)  # percentage 0–100
    energy_usage = db.Column(db.Float, default=0.0)  # kWh


class Order(db.Model):
    __tablename__ = "orders"
    id = db.Column(db.Integer, primary_key=True)
    customer = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    status = db.Column(
        db.String(20), default="pending"
    )  # pending, in_progress, completed


class EnergyPrice(db.Model):
    __tablename__ = "energy_prices"
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    price_per_kwh = db.Column(db.Float, nullable=False)


class AgentDecision(db.Model):
    __tablename__ = "agent_decisions"
    id = db.Column(db.Integer, primary_key=True)
    agent_name = db.Column(db.String(30), nullable=False)
    decision = db.Column(db.Text, nullable=False)
    impact = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
