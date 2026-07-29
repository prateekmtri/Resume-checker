# app/main.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.models import user, resume, email
from app.api.v1.endpoints import resume, email
from app.api import auth
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobAI API")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("✅ JobAI Backend started!")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"📨 Request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"✅ Response: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        raise

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/api/v1/resume", tags=["Resume"])
app.include_router(email.router, prefix="/api/v1/email", tags=["Email"])

@app.get("/")
def read_root():
    return {"status": "online", "message": "Backend is running successfully!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "All systems operational"}