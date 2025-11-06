# backend/config.py
import os

# MySQL connection (use env vars in production)
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "password")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "legal_ai")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

# Model paths
BASE_MODEL_DIR = os.getenv("BASE_MODEL_DIR", "models")
BART_MODEL_NAME = os.getenv("BART_MODEL_NAME", "facebook/bart-large-cnn")
MBART_MODEL_NAME = os.getenv("MBART_MODEL_NAME", "facebook/mbart-large-50-many-to-many-mmt")

# Uploads
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

# Embedding model
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# Fine-tune defaults
DEFAULT_TRAIN_EPOCHS = int(os.getenv("DEFAULT_TRAIN_EPOCHS", "2"))
