# 📄 Resume Scanner - AI-Powered Resume Analysis

An intelligent resume scanning and analysis application built with **FastAPI**, **LangChain**, and **Groq LLM**. This project uses RAG (Retrieval-Augmented Generation) to analyze resumes and provide detailed insights about skills, experiences, and qualifications.

## 🚀 Features

- **PDF Resume Upload**: Upload resume PDFs for analysis
- **AI-Powered Analysis**: Uses Groq's LLaMA 3.3 70B model for intelligent insights
- **Vector Search**: ChromaDB for efficient document retrieval
- **Embeddings**: HuggingFace sentence-transformers for semantic search
- **RESTful API**: FastAPI backend with CORS support
- **Modern Frontend**: Clean and responsive user interface

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - LLM application framework
- **Groq** - Fast LLM inference
- **ChromaDB** - Vector database
- **PyPDF** - PDF processing
- **Sentence Transformers** - Text embeddings

### Frontend
- **HTML/CSS/JavaScript**
- Responsive design

## 📋 Prerequisites

- Python 3.11+
- Groq API Key ([Get it here](https://console.groq.com))

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/prateekmtri/Resume-Scanner.git
cd Resume-Scanner
```

### 2. Create virtual environment

```bash
python -m venv venv
source venv/Scripts/activate  # On Windows
# source venv/bin/activate    # On Mac/Linux
```

### 3. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Set up environment variables

Create a `.env` file in the `backend` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
python -m uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

### Open Frontend

Open `frontend/index.html` in your browser or use a local server:

```bash
cd frontend
python -m http.server 8080
```

Then visit `http://localhost:8080`

## 📁 Project Structure

```
Gen_AI_Project/
│
├── backend/
│   ├── langchain_pipeline.py    # Core RAG pipeline
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Environment variables (create this)
│   ├── temp/                    # Temporary file storage
│   ├── chroma_db/              # Vector database storage
│   └── utils/                   # Utility functions
│
├── frontend/
│   ├── index.html              # Main HTML file
│   ├── styles/                 # CSS files
│   └── scripts/                # JavaScript files
│
├── venv/                       # Virtual environment (ignored)
└── README.md                   # This file
```

## 🔑 API Endpoints

### POST `/upload/`
Upload a PDF resume for analysis

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (PDF)

**Response:**
```json
{
  "feedback": "Analysis of the resume including skills, experiences, etc."
}
```

## 🧪 Example Usage

```python
import requests

url = "http://127.0.0.1:8000/upload/"
files = {"file": open("resume.pdf", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key | Yes |

## 📝 Model Information

Currently using:
- **LLM**: `llama-3.3-70b-versatile` (Groq)
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2`
- **Vector DB**: ChromaDB

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Prateek Mittal**
- GitHub: [@prateekmtri](https://github.com/prateekmtri)
- Email: prateek1tri2@gmail.com

## 🙏 Acknowledgments

- LangChain for the amazing framework
- Groq for fast LLM inference
- HuggingFace for embeddings models

## 📞 Support

For support, email prateek1tri2@gmail.com or open an issue in the repository.

---

⭐ If you found this project helpful, please give it a star!