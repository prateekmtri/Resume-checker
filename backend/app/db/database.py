from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Hum abhi ke liye SQLite use kar rahe hain (Simple file database)
SQLALCHEMY_DATABASE_URL = "sqlite:///./jobai.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Ye function har request ke liye DB session dega
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()