"""Thin service layer for the interview prep agent, streaming step-by-step results."""

import json
import logging

from sqlalchemy.orm import Session

from app.graphs.interview_prep_graph import build_interview_prep_graph

logger = logging.getLogger(__name__)


async def stream_interview_prep(company: str, role: str, user_id: int, db: Session):
    """Invoke the interview prep graph and stream each completed step to the client."""
    graph = build_interview_prep_graph()
    state = {
        "user_id": user_id,
        "company": company,
        "role": role,
        "db": db,
        "resume_text": "",
        "job_requirements": "",
        "gap_analysis": "",
        "questions": "",
        "email_draft": "",
    }

    try:
        for step_output in graph.stream(state):
            for node_name, node_result in step_output.items():
                payload = {"step": node_name, "result": node_result}
                yield f"data: {json.dumps(payload)}\n\n"

        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Interview prep streaming error: {str(e)}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"