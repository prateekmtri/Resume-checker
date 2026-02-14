from groq import Groq
import os
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