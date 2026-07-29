from dotenv import load_dotenv
load_dotenv()

from groq import Groq
import os
from sqlalchemy.orm import Session
from app.models.email import GeneratedEmail
from app.schemas.email import EmailRequest, EmailResponse

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def generate_email_content(request: EmailRequest):
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
        model="llama-3.3-70b-versatile",
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
    prompt = f"""Write a {tone} email about: {topic}

Length: {length}
Tone: {tone}

Generate:
1. Subject line (start with "Subject:")
2. Email body (professional format with greeting, body, closing)

Make it natural, clear, and actionable."""

    stream = client.chat.completions.create(
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
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=1024,
        stream=True,
    )

    full_content = ""

    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            full_content += content
            yield f"data: {content}\n\n"

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
