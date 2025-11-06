# backend/database.py
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from .config import SQLALCHEMY_DATABASE_URL
import os

# Create DB folder if using sqlite fallback (not used here)
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserQuery(Base):
    __tablename__ = "user_queries"
    id = Column(Integer, primary_key=True, index=True)
    input_text = Column(Text, nullable=False)
    summary = Column(Text)
    simplified = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Law(Base):
    __tablename__ = "laws"
    id = Column(Integer, primary_key=True, index=True)
    law_ref = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)

class ModelVersion(Base):
    __tablename__ = "model_versions"
    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String(255), unique=True, index=True)
    path = Column(String(1024))
    created_at = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=False)
    dataset = Column(String(255))

class TrainJob(Base):
    __tablename__ = "train_jobs"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    status = Column(String(64), default="pending")  # pending, running, done, failed
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

# create tables
Base.metadata.create_all(bind=engine)
