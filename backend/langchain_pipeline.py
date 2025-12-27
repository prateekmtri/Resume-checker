import os
from dotenv import load_dotenv
load_dotenv()

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough


# 1. Load PDF
def load_resume(path):
    loader = PyPDFLoader(path)
    return loader.load()


# 2. Split documents into chunks
def split_docs(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150
    )
    return splitter.split_documents(documents)


# 3. Create embeddings (using HuggingFace model)
def create_embeddings():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )


# 4. Store documents in vector database
def store_documents(chunks, embeddings):
    vectordb = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="chroma_db"
    )
    vectordb.persist()
    return vectordb


# 5. Analyze resume using RAG
def analyze_resume(query, vectordb):
    # Create retriever
    retriever = vectordb.as_retriever(search_kwargs={"k": 4})

    # Initialize Groq LLM
    llm = ChatGroq(
        groq_api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",  # Updated model name
        temperature=0.3
    )

    # Create prompt template
    prompt = ChatPromptTemplate.from_template("""
You are a professional resume reviewer.
Use the following resume content to answer the question.

Context:
{context}

Question: {input}

Answer:""")

    # Helper function to format documents
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    # Create RAG chain using LCEL (LangChain Expression Language)
    rag_chain = (
        {
            "context": retriever | format_docs,
            "input": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    # Invoke the chain and return result
    result = rag_chain.invoke(query)
    return result