from pydantic import BaseModel

class EmailRequest(BaseModel):
    topic: str
    tone: str = "professional"
    length: str = "medium"

class EmailResponse(BaseModel):
    email: str
    subject: str