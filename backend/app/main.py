from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# --- NEW IMPORTS (Ye add karo) ---
from app.db.database import engine, Base 
from app.models import user  # Ye zaroori hai taaki table create ho sake
from app.api import auth     # Ye tumhara naya auth router hai
# ---------------------------------

load_dotenv()

from app.api.v1.endpoints import resume, email

# --- CREATE DATABASE TABLES (Ye line sabse important hai SQLite ke liye) ---
# Jab server start hoga, ye check karega ki tables hain ya nahi. Nahi hain to bana dega.
user.Base.metadata.create_all(bind=engine)
# -------------------------------------------------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing routers
app.include_router(resume.router, prefix="/api/v1/resume", tags=["Resume"])
app.include_router(email.router, prefix="/api/v1/email", tags=["Email"])

# --- NEW AUTH ROUTER (Ye line add karo) ---
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
# ------------------------------------------