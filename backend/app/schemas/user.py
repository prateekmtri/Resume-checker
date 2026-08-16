from pydantic import BaseModel, EmailStr
from typing import Optional

# Base schema
class UserBase(BaseModel):
    email: EmailStr

# Signup ke waqt ye data chahiye
class UserCreate(UserBase):
    full_name: str
    password: str

# Login ke waqt ye data chahiye
class UserLogin(UserBase):
    password: str

# Response me hum password wapas nahi bhejenge, sirf ye details denge
class UserResponse(UserBase):
    id: int
    full_name: str
    is_active: bool
    profile_picture:  Optional[str] = None

    class Config:
        from_attributes = True
        
            
# Token ka schema
class Token(BaseModel):
    access_token: str
    token_type: str