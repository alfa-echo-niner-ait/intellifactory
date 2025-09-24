"""
Run: python seed_db.py
Seeds IntelliFactory database with dummy data.
"""

from app import app
from src.utils.mock_data import seed_data

if __name__ == "__main__":
    with app.app_context():
        seed_data(app)
