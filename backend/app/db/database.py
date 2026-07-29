import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Use PostgreSQL when DATABASE_URL is set, otherwise fall back to SQLite for local dev
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./jobai.db"

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Ye function har request ke liye DB session dega
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()