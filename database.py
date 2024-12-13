#!/usr/bin/python3
"""Configuration for the database"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

# Use SQLite for simplicity
DATABASE_URL = 'sqlite:///library_management.db'

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create the database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Provides a database session for a single request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
