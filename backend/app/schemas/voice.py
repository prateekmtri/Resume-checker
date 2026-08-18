from pydantic import BaseModel, Field
from typing import Optional


class VoiceChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's transcribed speech text")
    session_id: Optional[str] = Field(None, description="Client-generated session id to keep conversation context")


class VoiceChatResponse(BaseModel):
    response: str
    session_id: str