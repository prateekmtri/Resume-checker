# app/services/resume_service.py

import logging
logger = logging.getLogger(__name__)

# Don't use heavy models on free tier
async def process_resume(file):
    try:
        logger.info(f"📄 Processing resume: {file.filename}")
        
        # Read file
        content = await file.read()
        text = content.decode('utf-8', errors='ignore')
        
        # Simple rule-based analysis (no ML)
        score = 7
        
        strengths = []
        improvements = []
        missing = []
        
        # Basic checks
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