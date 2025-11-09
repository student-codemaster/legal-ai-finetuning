# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# Database
# Use the consolidated development DB by default. You can override with the
# DATABASE_URL environment variable in production or other environments.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./legal_dev.db")

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-very-secure-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# File Upload
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "backend/uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB

# Model Paths
MODEL_DIR = os.getenv("MODEL_DIR", "backend/models")
ACTIVE_MODEL_DIR = os.path.join(MODEL_DIR, "active")

# Backwards-compatible names used elsewhere in the codebase
BASE_MODEL_DIR = MODEL_DIR
MODEL_PATH = ACTIVE_MODEL_DIR

# Default model names (used by module3_ai when downloading/falling back)
BART_MODEL_NAME = os.getenv("BART_MODEL_NAME", "facebook/bart-large-cnn")
MBART_MODEL_NAME = os.getenv("MBART_MODEL_NAME", "facebook/mbart-large-50-many-to-many-mmt")

# Fine-tune defaults
DEFAULT_TRAIN_EPOCHS = int(os.getenv("DEFAULT_TRAIN_EPOCHS", "2"))

# CORS Origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

# Application Settings
APP_NAME = os.getenv("APP_NAME", "AI Legal Simplifier")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Embedding model used by module4_lawlink
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")