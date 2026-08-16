"""Thin resume service wrapper around the LangGraph analysis workflow."""

import logging

from sqlalchemy.orm import Session

from app.graphs.resume_graph import build_resume_graph
from app.models.resume import Resume

logger = logging.getLogger(__name__)


async def stream_resume_analysis(file_bytes: bytes, filename: str, user_id: int, db: Session):
    """Invoke the graph, stream the final response, and persist the result."""
    graph = build_resume_graph()
    state = {
        "file_bytes": file_bytes,
        "filename": filename,
        "documents": [],
        "chunks": [],
        "vectordb": None,
        "query": "resume strengths improvements missing skills ATS score",
        "result": "",
    }
    full_response = ""

    try:
        final_state = graph.invoke(state)
        full_response = final_state.get("result") or ""

        if not full_response:
            full_response = "Unable to generate resume analysis from the uploaded document."

        for chunk in full_response.split(" "):
            if not chunk:
                continue
            yield f"data: {chunk} \n\n"

        existing_resume = db.query(Resume).filter(Resume.user_id == user_id).first()
        if existing_resume:
            existing_resume.filename = filename
            existing_resume.analysis_text = full_response
        else:
            new_resume = Resume(user_id=user_id, filename=filename, analysis_text=full_response)
            db.add(new_resume)

        db.commit()
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Streaming resume analysis error: {str(e)}")
        yield f"data: Error: {str(e)}\n\n"
        yield "data: [DONE]\n\n"


async def process_resume(file):
    """Process an uploaded resume using a simple rule-based analysis."""
    try:
        logger.info(f"📄 Processing resume: {file.filename}")

        content = await file.read()
        text = content.decode('utf-8', errors='ignore')

        score = 7
        strengths = []
        improvements = []
        missing = []

        if len(text) > 500:
            strengths.append("Good content length")
        else:
            improvements.append("Resume seems too short")

        if "@" in text and "linkedin" in text.lower():
            strengths.append("Contact information included")
        else:
            missing.append("LinkedIn profile link")

        if any(word in text.lower() for word in ["increased", "improved", "reduced", "achieved"]):
            strengths.append("Uses strong action verbs")
            score += 1
        else:
            improvements.append("Add more action verbs and quantifiable achievements")

        if any(char.isdigit() for char in text):
            strengths.append("Includes quantifiable metrics")
        else:
            improvements.append("Add specific numbers and metrics")
            missing.append("Quantifiable achievements")

        feedback = f"""OVERALL SCORE: {score}/10

KEY STRENGTHS:
{chr(10).join(f"- {s}" for s in strengths)}

AREAS FOR IMPROVEMENT:
{chr(10).join(f"- {i}" for i in improvements)}

MISSING ELEMENTS:
{chr(10).join(f"- {m}" for m in missing)}

ACTIONABLE RECOMMENDATIONS:
- Add specific metrics (e.g., "Increased sales by 25%")
- Include LinkedIn and GitHub profile links
- Use strong action verbs throughout
- Add relevant certifications
- Include a professional summary

FINAL VERDICT:
Your resume has a solid foundation. Focus on adding quantifiable achievements and professional links to make it stand out."""

        logger.info(f"✅ Successfully processed: {file.filename}")
        return feedback

    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        raise
