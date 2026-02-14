from fastapi import APIRouter, HTTPException
from app.schemas.email import EmailRequest, EmailResponse
from app.services.email_service import generate_email_content

router = APIRouter()

@router.post("/generate", response_model=EmailResponse)
async def generate_email(request: EmailRequest):
    try:
        result = await generate_email_content(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")