from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
load_dotenv()

from langchain_pipeline import (
    load_resume,
    split_docs,
    create_embeddings,
    store_documents,
    analyze_resume
)

# 👇 Email router import
from email_writer import router as email_router

app = FastAPI()

# 👇 Email API add
app.include_router(email_router, prefix="/email", tags=["Email Writer"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload/")
async def upload_resume(file: UploadFile = File(...)):
    file_location = f"temp/{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())

    docs = load_resume(file_location)
    chunks = split_docs(docs)
    embeddings = create_embeddings()
    vectordb = store_documents(chunks, embeddings)

    result = analyze_resume("What are the skills and experiences?", vectordb)
    return {"feedback": result}
