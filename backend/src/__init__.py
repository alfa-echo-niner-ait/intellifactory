from flask import Flask
from flask_migrate import Migrate
from src.config import Config
from src.models import db
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    Migrate(app, db)
    CORS(app)
    
    # Register blueprints
    from src.blueprints.dashboard import dashboard_bp
    from src.blueprints.agents import agents_bp

    app.register_blueprint(dashboard_bp)
    app.register_blueprint(agents_bp)


    return app


app = create_app()
