"""Email generation services using the Groq API."""

import logging
import os

from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session

from app.graphs.email_graph import build_email_graph
from app.models.email import GeneratedEmail
from app.schemas.email import EmailRequest, EmailResponse

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
logger = logging.getLogger(__name__)


async def generate_email_content(request: EmailRequest):
    """Build an email subject and body from the request data."""
    prompt = f"""Write a {request.tone} email about: {request.topic}

Length: {request.length}
Tone: {request.tone}

Generate:
1. Subject line (start with "Subject:")
2. Email body (professional format with greeting, body, closing)

Make it natural, clear, and actionable."""

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an expert email writer. Write professional, clear, and effective emails."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="openai/gpt-oss-120b",
        temperature=0.7,
        max_tokens=1024,
    )

    response_text = chat_completion.choices[0].message.content
    lines = response_text.split('\n')
    subject = ""
    email_body = []

    for line in lines:
        if line.startswith("Subject:"):
            subject = line.replace("Subject:", "").strip()
        else:
            email_body.append(line)

    email_content = '\n'.join(email_body).strip()
    if not subject:
        subject = "Your Email Subject"

    return EmailResponse(email=email_content, subject=subject)


async def stream_email_content(topic: str, tone: str, length: str, user_id: int, db: Session):
    """Invoke the email graph, stream the final text to the client, and persist it."""
    graph = build_email_graph()
    state = {
        "topic": topic,
        "tone": tone,
        "length": length,
        "result": "",
    }

    try:
        final_state = graph.invoke(state)
        full_content = final_state.get("result") or ""

        if not full_content:
            full_content = "Unable to generate email content."

        for chunk in full_content.split(" "):
            if not chunk:
                continue
            yield f"data: {chunk} \n\n"

        existing_email = db.query(GeneratedEmail).filter(GeneratedEmail.user_id == user_id).first()
        if existing_email:
            existing_email.topic = topic
            existing_email.tone = tone
            existing_email.length = length
            existing_email.content = full_content
        else:
            new_email = GeneratedEmail(
                user_id=user_id,
                topic=topic,
                tone=tone,
                length=length,
                content=full_content,
            )
            db.add(new_email)

        db.commit()
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Streaming email generation error: {str(e)}")
        yield f"data: Error: {str(e)}\n\n"
        yield "data: [DONE]\n\n"
