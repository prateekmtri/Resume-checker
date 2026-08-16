"""Interview prep agent endpoint."""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.v1.endpoints.resume import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.interview_prep import InterviewPrepRequest
from app.services.interview_prep_service import stream_interview_prep

router = APIRouter()


@router.post("/generate")
async def generate_interview_prep(
    request: InterviewPrepRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stream a step-by-step interview prep session for the given company and role."""
    return StreamingResponse(
        stream_interview_prep(request.company, request.role, current_user.id, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )