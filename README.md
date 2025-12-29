📄 Resume Scanner – AI-Powered Resume Analysis Platform

An intelligent AI-powered Resume Scanner built with FastAPI, LangChain, Groq LLM, and a modern Next.js frontend.
This system uses Retrieval-Augmented Generation (RAG) to deeply analyze resumes and provide insights on skills, experience, and job fit.

Designed for students, job seekers, and recruiters to quickly understand resume quality using AI.

🚀 Live Capabilities

✔ Upload Resume (PDF)
✔ AI-based Skill Extraction
✔ Experience & Profile Summary
✔ Smart Resume Understanding using RAG
✔ Fast Response using Groq LLaMA 3.3
✔ Modern UI built with Next.js

🧠 How It Works

User uploads a resume

Resume is converted into text

Text is split into chunks

Chunks are converted into embeddings

Stored inside ChromaDB

Query is sent to Groq LLM

LLM retrieves relevant chunks

AI generates detailed resume feedback

🛠 Tech Stack
Backend

FastAPI

LangChain

Groq LLM

ChromaDB

PyPDF

HuggingFace Embeddings

Frontend

Next.js

Tailwind CSS

JavaScript

📸 Frontend Screenshots

Add your screenshots inside the repository folder: frontend/screenshots/

frontend/screenshots/
 ├── home.png
 ├── upload.png
 └── result.png


Then they will appear here 👇

Home Page

Resume Upload

AI Result

📦 Project Structure
Resume-Scanner/
│
├── backend/
│   ├── langchain_pipeline.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   ├── chroma_db/
│   └── utils/
│
├── frontend/   (Next.js)
│   ├── pages/
│   ├── components/
│   ├── styles/
│   └── screenshots/
│
├── README.md
└── .gitignore

⚙️ Installation
1️⃣ Clone Repo
git clone https://github.com/prateekmtri/Resume-Scanner.git
cd Resume-Scanner

2️⃣ Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt


Create .env file:

GROQ_API_KEY=your_api_key_here


Run server:

uvicorn main:app --reload


Backend runs at:

http://127.0.0.1:8000

3️⃣ Frontend Setup (Next.js)
cd frontend
npm install
npm run dev


Open:

http://localhost:3000

🔑 API Endpoint
POST /upload/

Uploads resume and returns AI feedback.

Response

{
  "feedback": "Your resume has strong skills in React, FastAPI, and backend development..."
}

🧠 AI Models Used
Component	Model
LLM	llama-3.3-70b-versatile (Groq)
Embeddings	all-MiniLM-L6-v2
Vector DB	ChromaDB
🌟 Why This Project is Special

Uses RAG architecture

Uses Groq ultra-fast inference

Real-world AI product

Fully Full-Stack AI Application

Resume-grade portfolio project

This is a strong internship-level AI SaaS project 💼

👤 Author

Prateek Mani Tripathi
MERN + AI Developer
GitHub: https://github.com/prateekmtri

Email: prateek1tri2@gmail.com

🤝 Contributing

Pull requests are welcome.

⭐ Support

If you like this project, please give it a star ⭐
It motivates me to build more AI tools.