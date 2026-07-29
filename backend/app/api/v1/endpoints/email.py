from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.security import SECRET_KEY, ALGORITHM
from app.db.database import get_db
from app.models.user import User
from app.models.email import GeneratedEmail
from app.schemas.email import EmailRequest, EmailResponse
from app.services.email_service import generate_email_content
from app.services.email_service import stream_email_content
from app.api.v1.endpoints.resume import get_current_user

router = APIRouter()

@router.post("/generate", response_model=EmailResponse)
async def generate_email(request: EmailRequest):
    try:
        result = await generate_email_content(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/generate/stream")
async def generate_email_stream(
    request: EmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return StreamingResponse(
        stream_email_content(request.topic, request.tone, request.length, current_user.id, db),
        media_type="text/event-stream"
    )


@router.get("/generate/latest")
async def get_latest_email(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    generated_email = db.query(GeneratedEmail).filter(GeneratedEmail.user_id == current_user.id).first()
    if not generated_email:
        raise HTTPException(status_code=404, detail="No email found")

    return {
        "topic": generated_email.topic,
        "tone": generated_email.tone,
        "length": generated_email.length,
        "content": generated_email.content,
        "created_at": generated_email.created_at,
    }
