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
    # 1. Absolute Path Setup (Render/Docker fix)
    # Isse hum current working directory se 'temp' folder ka sahi rasta nikalte hain
    base_path = os.getcwd() 
    upload_dir = os.path.join(base_path, "temp")
    
    # Agar folder kisi wajah se nahi bana, toh ye line use bana degi
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir, exist_ok=True)
        
    file_location = os.path.join(upload_dir, file.filename)

    # 2. File ko save karo
    try:
        content = await file.read()
        with open(file_location, "wb") as f:
            f.write(content)
    except Exception as e:
        print(f"Error saving file: {e}")
        return {"error": f"Internal Server Error while saving file: {str(e)}"}

    # 3. Resume processing logic
    try:
        docs = load_resume(file_location)
        chunks = split_docs(docs)
        embeddings = create_embeddings()
        vectordb = store_documents(chunks, embeddings)
        
        # AI Analysis
        result = analyze_resume("Analyze the resume and provide overall score, strengths, and improvements.", vectordb)
        
        return result
    except Exception as e:
        print(f"Analysis Error: {e}")
        return {"error": f"AI Analysis failed: {str(e)}"}
    finally:
        # Cleanup: Processing ke baad file delete karna taaki storage na bhare
        if os.path.exists(file_location):
            os.remove(file_location)