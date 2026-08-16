"""LangGraph workflow for resume analysis and ATS feedback generation."""

import os
import tempfile
from typing import Any, TypedDict

from dotenv import load_dotenv
from groq import Groq
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import END, START, StateGraph

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:  # pragma: no cover - fallback for environments without optional package
    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
    except ImportError:  # pragma: no cover
        HuggingFaceEmbeddings = None

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class State(TypedDict):
    """State passed between resume-analysis graph nodes."""

    file_bytes: bytes
    filename: str
    documents: list
    chunks: list[str]
    vectordb: Any
    query: str
    result: str


def load_resume_documents(state: State) -> dict:
    """Load the uploaded PDF into LangChain documents."""
    file_bytes = state.get("file_bytes") or b""
    if not file_bytes:
        return {"documents": []}

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name

        documents = PyPDFLoader(temp_path).load()
        return {"documents": documents}
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


def split_resume_chunks(state: State) -> dict:
    """Split the document text into analysis-ready chunks."""
    documents = state.get("documents") or []
    if not documents:
        return {"chunks": []}

    resume_text = "\n\n".join(document.page_content for document in documents)
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(resume_text)
    return {"chunks": chunks}


def build_resume_vectorstore(state: State) -> dict:
    """Create the embedding-backed vector store for relevant context retrieval."""
    chunks = state.get("chunks") or []
    if not chunks:
        return {"vectordb": None}

    if HuggingFaceEmbeddings is None:
        raise RuntimeError("HuggingFace embeddings support is not available in this environment.")

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectordb = Chroma.from_texts(texts=chunks, embedding=embeddings)
    return {"vectordb": vectordb}


def retrieve_resume_context(state: State) -> dict:
    """Retrieve the most relevant resume passages for ATS and feedback analysis."""
    query = state.get("query") or "resume strengths improvements missing skills ATS score"
    vectordb = state.get("vectordb")

    if vectordb is None:
        return {"query": query, "result": "No resume context available for analysis."}

    relevant_docs = vectordb.similarity_search(query, k=6)
    context = "\n\n".join(doc.page_content for doc in relevant_docs)
    return {"query": query, "result": context}


def generate_resume_analysis(state: State) -> dict:
    """Generate structured ATS and resume feedback from the retrieved context."""
    context = state.get("result") or ""
    if not context:
        return {"result": "No resume context available for analysis."}

    prompt = f"""You are an expert resume reviewer and ATS optimization specialist.

Analyze this resume and provide clear, actionable feedback.

Resume Content:
{context}

Provide the analysis with these exact sections:
1) Strengths
2) Improvements needed
3) Missing Skills
4) ATS score out of 10"""

    response = groq_client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an expert HR recruiter and ATS resume reviewer.",
            },
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=1024,
        stream=False,
    )

    result = response.choices[0].message.content or ""
    return {"result": result}


def build_resume_graph():
    """Build and return the compiled resume-analysis graph."""
    graph = StateGraph(State)

    graph.add_node("load_resume_documents", load_resume_documents)
    graph.add_node("split_resume_chunks", split_resume_chunks)
    graph.add_node("build_resume_vectorstore", build_resume_vectorstore)
    graph.add_node("retrieve_resume_context", retrieve_resume_context)
    graph.add_node("generate_resume_analysis", generate_resume_analysis)

    graph.add_edge(START, "load_resume_documents")
    graph.add_edge("load_resume_documents", "split_resume_chunks")
    graph.add_edge("split_resume_chunks", "build_resume_vectorstore")
    graph.add_edge("build_resume_vectorstore", "retrieve_resume_context")
    graph.add_edge("retrieve_resume_context", "generate_resume_analysis")
    graph.add_edge("generate_resume_analysis", END)

    return graph.compile()
