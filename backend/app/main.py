from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.models import user
from app.api.v1.endpoints import resume, email
from app.api import auth
import os


user.Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobAI API")

# CORS Configuration
# "*" ki jagah specific URLs dena better hai production mein
origins = [
    "http://localhost:3000",
    "https://newjobai.netlify.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/api/v1/resume", tags=["Resume"])
app.include_router(email.router, prefix="/api/v1/email", tags=["Email"])

@app.get("/")
def read_root():
    return {"status": "online", "message": "Backend is running successfully!"}