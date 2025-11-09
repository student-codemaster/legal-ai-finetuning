# backend/database.py
import logging
import os
from datetime import datetime

from sqlalchemy import (
    create_engine, Column, Integer, String, Text, DateTime, 
    Boolean, Float, ForeignKey, func
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

from .config import SQLALCHEMY_DATABASE_URL

# Configure basic logging for warnings during import-time DB setup
logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Try to create an engine using the configured DB URL. If that fails (missing driver,
# unreachable host, etc.) fall back to a local sqlite file so the app can still start
# in development. This avoids hard crashes at import time.
engine = None
try:
    # If the configured URL is SQLite, provide the sqlite-specific connect_args
    # required for safe usage with threaded servers (FastAPI + Uvicorn).
    if isinstance(SQLALCHEMY_DATABASE_URL, str) and SQLALCHEMY_DATABASE_URL.lower().startswith("sqlite"):
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            connect_args={"check_same_thread": False},
        )
    else:
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
except Exception as e:
    # Fail fast: don't silently create a second, separate DB file. Log and re-raise
    # so the developer can fix the configured DATABASE_URL or missing DB driver.
    logger.error(
        "Failed to create engine using SQLALCHEMY_DATABASE_URL (%s): %s",
        SQLALCHEMY_DATABASE_URL,
        e,
    )
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    queries = relationship("UserQuery", back_populates="user")
    sessions = relationship("UserSession", back_populates="user")

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(String(45))  # IPv6 support
    user_agent = Column(Text)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class UserQuery(Base):
    __tablename__ = "user_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Allow anonymous queries
    input_text = Column(Text, nullable=False)
    summary = Column(Text)
    simplified = Column(Text)
    detected_language = Column(String(10))
    processing_time = Column(Float)  # Time taken in seconds
    file_name = Column(String(255))  # If file was uploaded
    file_size = Column(Integer)  # File size in bytes
    articles_found = Column(Text)  # JSON string of articles
    law_details = Column(Text)  # JSON string of law details
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="queries")
    feedback = relationship("UserFeedback", back_populates="query")

class UserFeedback(Base):
    __tablename__ = "user_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("user_queries.id"), nullable=False)
    rating = Column(Integer)  # 1-5 stars
    feedback_text = Column(Text)
    helpful_summary = Column(Boolean)
    helpful_simplification = Column(Boolean)
    accuracy_rating = Column(Integer)  # 1-5
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    query = relationship("UserQuery", back_populates="feedback")

class Law(Base):
    __tablename__ = "laws"
    
    id = Column(Integer, primary_key=True, index=True)
    law_ref = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50))  # e.g., "criminal", "civil", "corporate"
    jurisdiction = Column(String(50), default="IN")  # Country code
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String(100), unique=True, nullable=False)
    path = Column(String(255), nullable=False)
    dataset = Column(String(255))
    active = Column(Boolean, default=False)
    accuracy = Column(Float)
    training_time = Column(Float)  # Hours
    created_at = Column(DateTime, default=datetime.utcnow)

class TrainJob(Base):
    __tablename__ = "train_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    status = Column(String(50), default="queued")  # queued, running, done, failed
    detail = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime)
    training_time = Column(Float)  # Seconds

class AppSettings(Base):
    __tablename__ = "app_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False)
    setting_value = Column(Text, nullable=False)
    description = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)  # 'query', 'login', 'download', etc.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    details = Column(Text)  # JSON string with event details
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables (safe to call regardless of backend)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    # Creating tables failed — this is likely a misconfiguration or missing driver.
    # Surface the error instead of silently switching to another DB file.
    logger.error("Failed to create DB tables at import time: %s", e)
    raise

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database initialization function
def init_database():
    """Initialize database with default data."""
    db = SessionLocal()
    
    try:
        # Create default admin user if not exists
        from .auth import get_password_hash
        
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@legalsimplifier.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                is_admin=True
            )
            db.add(admin_user)
            logger.info("✓ Default admin user created: admin/admin123")
        
        # Add some sample laws
        sample_laws = [
            {"law_ref": "IPC Section 302", "description": "Punishment for murder", "category": "criminal"},
            {"law_ref": "IPC Section 420", "description": "Cheating and dishonestly inducing delivery of property", "category": "criminal"},
            {"law_ref": "CrPC Section 154", "description": "Information in cognizable cases", "category": "criminal"},
            {"law_ref": "Contract Act Section 10", "description": "What agreements are contracts", "category": "civil"},
            {"law_ref": "Constitution Article 14", "description": "Equality before law", "category": "constitutional"},
            {"law_ref": "Constitution Article 21", "description": "Protection of life and personal liberty", "category": "constitutional"},
        ]
        
        for law_data in sample_laws:
            existing_law = db.query(Law).filter(Law.law_ref == law_data["law_ref"]).first()
            if not existing_law:
                law = Law(**law_data)
                db.add(law)
        
        # Add default app settings
        default_settings = [
            {"setting_key": "MAX_FILE_SIZE_MB", "setting_value": "10", "description": "Maximum file upload size in MB"},
            {"setting_key": "ALLOWED_FILE_TYPES", "setting_value": "pdf,docx", "description": "Allowed file types for upload"},
            {"setting_key": "DEFAULT_LANGUAGE", "setting_value": "en_XX", "description": "Default language for processing"},
            {"setting_key": "ENABLE_USER_REGISTRATION", "setting_value": "true", "description": "Allow new user registration"},
        ]
        
        for setting_data in default_settings:
            existing_setting = db.query(AppSettings).filter(AppSettings.setting_key == setting_data["setting_key"]).first()
            if not existing_setting:
                setting = AppSettings(**setting_data)
                db.add(setting)
        
        db.commit()
        logger.info("✓ Database initialized successfully with default data")
        
    except Exception as e:
        logger.error(f"✗ Database initialization failed: {e}")
        db.rollback()
    finally:
        db.close()

# Helper function to check if database is responsive
def check_database_health():
    """Check if database is accessible and responsive."""
    db = SessionLocal()
    try:
        # Try a simple query
        db.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False
    finally:
        db.close()

# Call initialization on import (optional - you might want to call this manually)
# init_database()