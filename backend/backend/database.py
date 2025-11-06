from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_URL = "sqlite:///backend/legal_ai.db"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class UserQuery(Base):
    __tablename__ = "user_queries"
    id = Column(Integer, primary_key=True, index=True)
    input_text = Column(String)
    summary = Column(String)
    simplified = Column(String)

class Law(Base):
    __tablename__ = "laws"
    id = Column(Integer, primary_key=True, index=True)
    law_ref = Column(String, unique=True, index=True)
    description = Column(String)

Base.metadata.create_all(bind=engine)
