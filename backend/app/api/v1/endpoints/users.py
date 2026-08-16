from fastapi import APIRouter , Depends
from app.api.v1.endpoints.resume import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/me" , response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Return the logged-in user's profile details."""
    return current_user