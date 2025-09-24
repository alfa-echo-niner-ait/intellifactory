import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(".env.local")


class Config:
    # Database Configuration
    DATABASE_URL = (
        os.environ.get("DATABASE_URL")
        or "postgresql://postgres:root@localhost:5432/intellifactory_db"
    )
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-key")

    # API Configuration
    MODEL_API_KEY = os.environ.get("MODEL_API_KEY")
    MODEL_BASE_URL = os.environ.get("MODEL_BASE_URL", "https://api.scnet.cn/api/llm/v1")
    MODEL = os.environ.get("MODEL", "DeepSeek-R1-Distill-Qwen-7B")
