# app/api/v1/endpoints/resume.py

"""Resume endpoints and authentication utilities."""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi import Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import logging
from app.core.security import SECRET_KEY, ALGORITHM
from app.db.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.services.resume_service import stream_resume_analysis

router = APIRouter()
logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    """Return the authenticated user from the bearer token."""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )

        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


@router.post("/upload/stream")
async def upload_resume_stream(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a resume and stream analysis results."""
    file_bytes = await file.read()
    return StreamingResponse(
        stream_resume_analysis(file_bytes, file.filename, current_user.id, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/latest")
async def get_latest_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return the authenticated user's latest resume analysis."""
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")

    return {
        "filename": resume.filename,
        "analysis": resume.analysis_text,
        "uploaded_at": resume.uploaded_at,
    }


@router.delete("/")
async def delete_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete the authenticated user's resume record."""
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    if resume:
        db.delete(resume)
        db.commit()

    return {"message": "Resume deleted successfully"}


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """Accept an uploaded resume and return mock feedback."""
    try:
        logger.info(f"📄 Received file: {file.filename}")

        if not file.filename.endswith((".pdf", ".txt")):
            raise HTTPException(status_code=400, detail="Only PDF and TXT files allowed")

        content = await file.read()
        logger.info(f"📦 File size: {len(content)} bytes")

        feedback = f"""OVERALL SCORE: 8/10

KEY STRENGTHS:
- Professional formatting and structure
- Clear and concise presentation
- Relevant work experience included
- Good use of action verbs

AREAS FOR IMPROVEMENT:
- Add more quantifiable achievements with specific metrics
- Strengthen the professional summary section
- Include more technical skills if applicable
- Consider adding project links or portfolio

MISSING ELEMENTS:
- LinkedIn profile URL
- GitHub or portfolio links
- Professional certifications section
- Volunteer work or extracurricular activities

ACTIONABLE RECOMMENDATIONS:
- Replace vague statements with specific numbers (e.g., "Increased sales by 25%")
- Add a compelling 2-3 line professional summary at the top
- Include links to your professional online presence
- Add relevant certifications or courses completed
- Use consistent formatting throughout the document

FINAL VERDICT:
Your resume ({file.filename}) demonstrates a solid foundation with clear structure and relevant content. To make it truly stand out, focus on adding quantifiable achievements and measurable impact. Including professional links and certifications will further strengthen your candidacy. Overall, with these improvements, your resume will be highly competitive."""

        logger.info(f"✅ Successfully processed: {file.filename}")
        return JSONResponse(
            status_code=200,
            content={"feedback": feedback, "filename": file.filename}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error processing resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
