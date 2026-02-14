import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

def load_resume(path):
    loader = PyPDFLoader(path)
    return loader.load()

def split_docs(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150
    )
    return splitter.split_documents(documents)

def create_embeddings():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

def store_documents(chunks, embeddings):
    vectordb = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="chroma_db"
    )
    return vectordb

def analyze_resume(query, vectordb):
    retriever = vectordb.as_retriever(search_kwargs={"k": 6})

    llm = ChatGroq(
        groq_api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.7
    )

    prompt = ChatPromptTemplate.from_template("""
You are an expert HR recruiter and professional resume reviewer with 15+ years of experience.

Analyze the following resume thoroughly and provide a comprehensive, actionable review.

Resume Content:
{context}

Your Task: {input}

Provide your analysis in the following structured format:

📊 OVERALL SCORE: X/10

✅ KEY STRENGTHS:
- List 3-4 major strong points
- Be specific about what makes them strong
- Mention standout skills, achievements, or experiences

⚠️ AREAS FOR IMPROVEMENT:
- List 3-4 critical improvements needed
- Explain WHY each improvement matters
- Be constructive and specific

🎯 MISSING ELEMENTS:
- What important sections or details are missing?
- What should be added to make it ATS-friendly?

💡 ACTIONABLE RECOMMENDATIONS:
- Provide 3-5 specific actions to improve the resume
- Mention industry-standard best practices
- Suggest quantifiable metrics to add if missing

🔑 FINAL VERDICT:
- One paragraph summary
- Is this resume likely to get interviews?
- Overall readiness level (Beginner/Intermediate/Strong/Excellent)

Remember: Be honest, constructive, and focus on actionable feedback that will help the candidate improve their resume and land interviews.""")

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {
            "context": retriever | format_docs,
            "input": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    result = rag_chain.invoke(query)
    return result