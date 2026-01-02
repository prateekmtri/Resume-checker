from fastapi import APIRouter, UploadFile, File
from app.services.resume_service import process_resume

router = APIRouter()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    result = await process_resume(file)
    return {"feedback": result}