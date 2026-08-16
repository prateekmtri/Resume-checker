"""Request and response schemas for the interview prep agent."""
from pydantic import BaseModel

"""Input needed to start an interview prep session."""
class InterviewPrepRequest(BaseModel):
    company:str
    role:str