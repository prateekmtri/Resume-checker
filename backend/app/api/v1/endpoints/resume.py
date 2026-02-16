# app/api/v1/endpoints/resume.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        logger.info(f"📄 Received file: {file.filename}")
        
        # Validate file
        if not file.filename.endswith(('.pdf', '.txt')):
            raise HTTPException(status_code=400, detail="Only PDF and TXT files allowed")
        
        # Read file content
        content = await file.read()
        logger.info(f"📦 File size: {len(content)} bytes")
        
        # MOCK RESPONSE - No AI processing (fast!)
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