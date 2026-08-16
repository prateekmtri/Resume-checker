"""LangGraph workflow for the interview prep agent."""
import os
from typing import TypedDict , List
from dotenv import load_dotenv
from groq import Groq
from langgraph.graph import START , END , StateGraph
from sqlalchemy.orm import Session

from app.models.resume import Resume

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class State(TypedDict):
    """State passed between interview-prep graph nodes."""
    user_id:int
    company:str
    role:str
    db:Session
    resume_text:str
    job_requirements:str
    gap_analysis:str
    questions:str
    email_draft:str

    
def fetch_resume_node(state:State)->dict:
    db = state.get("db")
    user_id = state.get("user_id")
    
    resume = db.query(Resume).filter(Resume.user_id == user_id).first()
    
    if not resume:
        return{"resume_text":"No resume found for this user"}
    
    return{"resume_text":resume.analysis_text}  



def research_job_node(state: State) -> dict:
    """Generate typical job requirements for the given company and role using AI knowledge."""
    company = state.get("company")
    role = state.get("role")

    prompt = f"""List the typical skills, qualifications, and requirements 
for a {role} position at {company}. Base this on general industry knowledge 
about this role and company type. Provide a clear, structured list."""

    response = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a knowledgeable technical recruiter."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=512,
    )

    result = response.choices[0].message.content or ""
    return {"job_requirements": result}




def gap_analysis_node(state: State) -> dict:
    """Compare resume against job requirements to find matched and missing skills."""
    resume_text = state.get("resume_text")
    job_requirements = state.get("job_requirements")

    prompt = f"""Compare this candidate's resume against the job requirements below.

Resume Analysis:
{resume_text}

Job Requirements:
{job_requirements}

List clearly:
1. Skills the candidate HAS that match the job
2. Skills the candidate is MISSING for this job"""

    response = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an expert career coach analyzing skill gaps."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=512,
    )

    result = response.choices[0].message.content or ""
    return {"gap_analysis": result}


def generate_questions_node(state: State) -> dict:
    """Generate personalized interview questions based on resume and job requirements."""
    resume_text = state.get("resume_text")
    job_requirements = state.get("job_requirements")
    gap_analysis = state.get("gap_analysis")

    prompt = f"""Based on this candidate's resume, the job requirements, and their skill gaps, 
generate 8-10 personalized interview questions. Questions should reference the candidate's 
actual experience, not be generic.

Resume Analysis:
{resume_text}

Job Requirements:
{job_requirements}

Skill Gap Analysis:
{gap_analysis}"""

    response = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an expert technical interviewer."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=1024,
    )

    result = response.choices[0].message.content or ""
    return {"questions": result}




def write_email_node(state: State) -> dict:
    """Draft a professional application email for the target role."""
    company = state.get("company")
    role = state.get("role")
    resume_text = state.get("resume_text")

    prompt = f"""Write a professional job application email for a {role} position 
at {company}. Base it on this candidate's background:

{resume_text}

Include a subject line and a concise, compelling email body."""

    response = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an expert career coach writing application emails."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=512,
    )

    result = response.choices[0].message.content or ""
    return {"email_draft": result}



def build_interview_prep_graph():
    """Build and return the compiled interview-prep graph."""
    graph = StateGraph(State)

    graph.add_node("fetch_resume", fetch_resume_node)
    graph.add_node("research_job", research_job_node)
    graph.add_node("gap_analysis", gap_analysis_node)
    graph.add_node("generate_questions", generate_questions_node)
    graph.add_node("write_email", write_email_node)

    graph.add_edge(START, "fetch_resume")
    graph.add_edge("fetch_resume", "research_job")
    graph.add_edge("research_job", "gap_analysis")
    graph.add_edge("gap_analysis", "generate_questions")
    graph.add_edge("generate_questions", "write_email")
    graph.add_edge("write_email", END)

    return graph.compile()
    