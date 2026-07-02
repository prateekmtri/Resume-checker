from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.email import EmailRequest, EmailResponse
from app.services.email_service import generate_email_content
from app.services.email_service import stream_email_content

router = APIRouter()

@router.post("/generate", response_model=EmailResponse)
async def generate_email(request: EmailRequest):
    try:
        result = await generate_email_content(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/generate/stream")
async def generate_email_stream(request: EmailRequest):
    return StreamingResponse(
        stream_email_content(request.topic, request.tone, request.length),
        media_type="text/event-stream"
    )
