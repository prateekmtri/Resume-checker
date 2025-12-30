from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Import routers
from resume_scanner import router as resume_router
from email_writer import router as email_router

app = FastAPI(title="Gen AI Project - Multi Tool API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume_router, prefix="/resume", tags=["Resume Scanner"])
app.include_router(email_router, prefix="/email", tags=["Email Writer"])

@app.get("/")
def home():
    return {
        "message": "Gen AI Project API",
        "endpoints": {
            "resume_scanner": "/resume/upload",
            "email_writer": "/email/generate"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)