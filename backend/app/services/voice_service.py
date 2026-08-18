import os
import uuid
from groq import Groq
from app.schemas.voice import VoiceChatRequest, VoiceChatResponse

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found in environment. Add it to backend/.env")

_client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """
You are the voice assistant for JobAI - an AI-powered career assistant platform.
The user is talking to you by voice, so reply in short, spoken-style sentences (2-3 sentences max).
Never use markdown, asterisks, or bullet points - this text will be read aloud.

About JobAI platform (explain these in detail whenever asked):
- Resume Scanner: user uploads their PDF resume and instantly gets an ATS score, strengths, improvement suggestions, and missing skills.
- Email Writer: user enters a topic, tone, and length, and gets a ready-to-send professional job application email.
- Interview Prep: user enters a target company and role. An AI agent then analyzes the role step by step, generates personalized interview questions, compares the user's resume against the role to find skill gaps, and drafts an HR outreach email.

Rules:
- Be warm, concise, and conversational, like a helpful guide speaking out loud.
- If asked "what can this website do" or similar, summarize all three features briefly, then ask which one they want to know more about.
- If asked about something unrelated to JobAI, politely steer them back to what JobAI offers.
"""

# In-memory session store. Swap for Redis/DB if you need it to survive server restarts.
_chat_histories: dict[str, list[dict]] = {}


def _get_history(session_id: str) -> list[dict]:
    if session_id not in _chat_histories:
        _chat_histories[session_id] = [{"role": "system", "content": SYSTEM_PROMPT}]
    return _chat_histories[session_id]


async def get_voice_response(payload: VoiceChatRequest) -> VoiceChatResponse:
    session_id = payload.session_id or str(uuid.uuid4())
    history = _get_history(session_id)
    history.append({"role": "user", "content": payload.message})

    completion = _client.chat.completions.create(
        messages=history,
        model="openai/gpt-oss-120b",
        max_tokens=300,
        temperature=0.7,
    )

    reply = completion.choices[0].message.content.strip()
    history.append({"role": "assistant", "content": reply})

    # keep history bounded so it doesn't grow forever
    if len(history) > 21:
        _chat_histories[session_id] = [history[0]] + history[-20:]

    return VoiceChatResponse(response=reply, session_id=session_id)