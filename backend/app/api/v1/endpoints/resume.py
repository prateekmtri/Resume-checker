from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.resume_service import process_resume
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        logger.info(f"📄 Received file: {file.filename}")
        
        # File validation
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")
        
        # File type check
        allowed_extensions = [".pdf", ".txt"]
        file_ext = file.filename[file.filename.rfind('.'):].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type {file_ext} not supported. Use PDF or TXT only."
            )
        
        # Process resume
        result = await process_resume(file)
        logger.info(f"✅ Successfully processed: {file.filename}")
        
        return {"feedback": result}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error processing resume: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))