from pydantic import BaseModel, EmailStr

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

    class Config:
        from_attributes = True

# Token ka schema
class Token(BaseModel):
    access_token: str
    token_type: str