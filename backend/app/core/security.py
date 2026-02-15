import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# Secret Key (Render dashboard se load hoga, fallback ke liye default rakha hai)
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-jobai-project")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Maine 60 kar diya hai thoda extra time ke liye

# Bcrypt configurations ko update kiya hai taaki compatibility issues na aayein
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__ident="2b" # Specifically set to avoid passlib attribute errors
)

# Password ko hash karna
def get_password_hash(password: str) -> str:
    # Bcrypt ki 72 byte limit se bachne ke liye hum long passwords ko handle karta hai passlib
    return pwd_context.hash(password)

# Password check karna (Login ke time)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False

# JWT Token banana
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    # Python 3.12+ ke liye datetime.now(timezone.utc) use karna better hai
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt