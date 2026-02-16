import os
from fastapi import UploadFile
from app.langchain.resume_analyzer import (
    load_resume,
    split_docs,
    create_embeddings,
    store_documents,
    analyze_resume
)

async def process_resume(file: UploadFile):
    # 1. Folder setup (Render/Docker compatibility ke liye)
    upload_dir = "temp"
    
    # Agar folder nahi hai, to use create kar lo
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    file_location = os.path.join(upload_dir, file.filename)

    # 2. File ko save karo
    try:
        with open(file_location, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        return {"error": f"Failed to save file: {str(e)}"}

    # 3. Resume processing logic
    try:
        docs = load_resume(file_location)
        chunks = split_docs(docs)
        embeddings = create_embeddings()
        
        # ChromaDB ya Vector Store logic
        vectordb = store_documents(chunks, embeddings)
        
        # AI Analysis
        result = analyze_resume("Analyze the resume and provide overall score, strengths, and improvements.", vectordb)
        
        return result
    except Exception as e:
        return {"error": f"Analysis failed: {str(e)}"}
    finally:
        # Optional: Processing ke baad temp file delete karna achhi baat hai
        if os.path.exists(file_location):
            os.remove(file_location)