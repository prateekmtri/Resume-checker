from fastapi import APIRouter, HTTPException
from app.schemas.voice import VoiceChatRequest, VoiceChatResponse
from app.services.voice_service import get_voice_response

router = APIRouter(tags=["Voice Bot"])


@router.post("/chat", response_model=VoiceChatResponse)
async def voice_chat(payload: VoiceChatRequest):
    try:
        return await get_voice_response(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice chat failed: {str(e)}")