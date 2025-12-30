from fastapi import APIRouter, UploadFile, File

from langchain_pipeline import (
    load_resume,
    split_docs,
    create_embeddings,
    store_documents,
    analyze_resume
)

router = APIRouter()

@router.post("/upload")
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