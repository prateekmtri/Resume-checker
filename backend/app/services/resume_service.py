"""Resume analysis and streaming service utilities."""

import logging
import os
import tempfile
from dotenv import load_dotenv
from groq import Groq
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from sqlalchemy.orm import Session
from app.models.resume import Resume

logger = logging.getLogger(__name__)
load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


async def stream_resume_analysis(file_bytes: bytes, filename: str, user_id: int, db: Session):
    """Stream resume analysis results and persist the output."""
    temp_path = None
    full_response = ""

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name

        loader = PyPDFLoader(temp_path)
        documents = loader.load()
        resume_text = "\n\n".join(document.page_content for document in documents)

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = splitter.split_text(resume_text)

        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vectorstore = Chroma.from_texts(
            texts=chunks,
            embedding=embeddings
        )
        relevant_docs = vectorstore.similarity_search(
            "resume strengths improvements missing skills ATS score",
            k=6
        )
        context = "\n\n".join(doc.page_content for doc in relevant_docs)

        prompt = f"""You are an expert resume reviewer and ATS optimization specialist.

Analyze this resume and provide clear, actionable feedback.

Resume Content:
{context}

Provide the analysis with these exact sections:
1) Strengths
2) Improvements needed
3) Missing Skills
4) ATS score out of 10"""

        stream = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert HR recruiter and ATS resume reviewer."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1024,
            stream=True,
        )

        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                full_response += content
                yield f"data: {content}\n\n"

        existing_resume = db.query(Resume).filter(Resume.user_id == user_id).first()
        if existing_resume:
            existing_resume.filename = filename
            existing_resume.analysis_text = full_response
        else:
            new_resume = Resume(user_id=user_id, filename=filename, analysis_text=full_response)
            db.add(new_resume)

        db.commit()

        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Streaming resume analysis error: {str(e)}")
        yield f"data: Error: {str(e)}\n\n"
        yield "data: [DONE]\n\n"

    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


async def process_resume(file):
    """Process an uploaded resume using a simple rule-based analysis."""
    try:
        logger.info(f"📄 Processing resume: {file.filename}")

        content = await file.read()
        text = content.decode('utf-8', errors='ignore')

        score = 7
        strengths = []
        improvements = []
        missing = []

        if len(text) > 500:
            strengths.append("Good content length")
        else:
            improvements.append("Resume seems too short")

        if "@" in text and "linkedin" in text.lower():
            strengths.append("Contact information included")
        else:
            missing.append("LinkedIn profile link")

        if any(word in text.lower() for word in ["increased", "improved", "reduced", "achieved"]):
            strengths.append("Uses strong action verbs")
            score += 1
        else:
            improvements.append("Add more action verbs and quantifiable achievements")

        if any(char.isdigit() for char in text):
            strengths.append("Includes quantifiable metrics")
        else:
            improvements.append("Add specific numbers and metrics")
            missing.append("Quantifiable achievements")

        feedback = f"""OVERALL SCORE: {score}/10

KEY STRENGTHS:
{chr(10).join(f"- {s}" for s in strengths)}

AREAS FOR IMPROVEMENT:
{chr(10).join(f"- {i}" for i in improvements)}

MISSING ELEMENTS:
{chr(10).join(f"- {m}" for m in missing)}

ACTIONABLE RECOMMENDATIONS:
- Add specific metrics (e.g., "Increased sales by 25%")
- Include LinkedIn and GitHub profile links
- Use strong action verbs throughout
- Add relevant certifications
- Include a professional summary

FINAL VERDICT:
Your resume has a solid foundation. Focus on adding quantifiable achievements and professional links to make it stand out."""

        logger.info(f"✅ Successfully processed: {file.filename}")
        return feedback

    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        raise
