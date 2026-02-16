# 📄 JobAI – AI-Powered Resume & Email Assistant Platform

<div align="center">

![JobAI Banner](https://via.placeholder.com/1200x300/0f172a/3b82f6?text=JobAI+-+Your+Smart+Career+Assistant)

**A production-grade, cloud-native AI platform with containerized microservices, CI/CD pipelines, and intelligent career assistance**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![LangChain](https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white)](https://www.langchain.com/)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)

[Live Demo](#) • [Report Bug](https://github.com/prateekmtri/Resume-Scanner/issues) • [Request Feature](https://github.com/prateekmtri/Resume-Scanner/issues)

</div>

---

## 🌟 Overview

JobAI is a **production-ready, cloud-native** full-stack career assistance platform featuring **containerized microservices**, **automated CI/CD pipelines**, and **advanced RAG-based AI**. Built with modern DevOps practices, it provides secure, scalable resume analysis and professional email generation. The platform demonstrates enterprise-grade architecture with Docker containerization, GitHub Actions automation, and cloud deployment on Netlify and Render.

### ✨ Key Features

#### 🐳 DevOps & Infrastructure
- 🏗️ **Dockerized Microservices** - Containerized frontend and backend with multi-stage builds
- 🔄 **CI/CD Pipeline** - Automated testing, building, and deployment with GitHub Actions
- ☁️ **Cloud Deployment** - Frontend on Netlify, Backend on Render
- 📦 **Docker Compose** - Orchestrated multi-container deployment
- 🚀 **Production-Ready** - Environment-based configuration and zero-downtime deployments
- 📊 **Infrastructure as Code** - Declarative deployment configurations

#### 🔐 User Authentication
- 🔒 **Secure Sign Up & Login** - JWT-based authentication with bcrypt hashing
- 👤 **User Profiles** - Personalized user experience with session management
- 🗄️ **SQLite Database** - Reliable data persistence with ORM
- 🛡️ **Protected Routes** - Middleware-based route protection
- 🔑 **Token Management** - Secure token generation and validation

#### 📄 Resume Scanner (RAG Pipeline)
- 📤 **Upload Resume** - Support for PDF format with file validation
- 🤖 **AI-Powered Analysis** - LangChain-based RAG architecture
- 📊 **Experience Summary** - Automated career progression analysis
- 🎯 **Vector Embeddings** - ChromaDB with HuggingFace embeddings
- 💡 **Actionable Feedback** - Context-aware recommendations using Groq LLaMA 3.3
- 🔍 **Semantic Search** - Intelligent document retrieval

#### ✉️ Professional Email Writer
- ✍️ **AI Email Generation** - Context-aware professional email crafting
- 🎨 **Customizable Tone** - Professional, Friendly, or Formal styles
- 📏 **Adjustable Length** - Short, Medium, or Long format options
- ⚡ **Instant Generation** - Sub-second response time with Groq
- 🎯 **Purpose-Driven** - Optimized for job applications and HR communication

#### ⚡ Core Technology Stack
- 🚀 **Lightning Fast** - Groq LLaMA 3.3 (70B) with 10x faster inference
- 🎨 **Modern UI** - Next.js 14 with Tailwind CSS and responsive design
- 🔒 **Secure & Scalable** - Production-grade security and horizontal scalability
- 🐍 **Python Backend** - FastAPI with async/await for high performance
- 🌐 **API-First Design** - RESTful API with OpenAPI documentation

---

## 🏗️ Architecture & Infrastructure

```mermaid
graph TB
    subgraph "CI/CD Pipeline"
        A[GitHub Repository] -->|Push/PR| B[GitHub Actions]
        B -->|Build & Test| C[Docker Build]
        C -->|Frontend Image| D[Netlify Deploy]
        C -->|Backend Image| E[Render Deploy]
    end
    
    subgraph "Production Environment"
        F[User] -->|HTTPS| G[Netlify CDN]
        G --> H[Next.js Frontend]
        H -->|REST API| I[Render Backend]
        
        subgraph "Backend Services"
            I[FastAPI] -->|Auth| J[JWT Middleware]
            J -->|Query| K[SQLite DB]
            I -->|Process| L[Resume Service]
            L -->|RAG| M[LangChain + ChromaDB]
            M -->|LLM| N[Groq API]
            I -->|Generate| O[Email Service]
            O -->|LLM| N
        end
    end
    
    subgraph "Local Development"
        P[Docker Compose] -->|Container 1| Q[Frontend:3000]
        P -->|Container 2| R[Backend:8000]
        R -->|Volume| S[Persistent Data]
    end
```

### 🐳 Docker Architecture

#### Multi-Stage Dockerfile (Backend)
```dockerfile
# Build stage
FROM python:3.9-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Optimized Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
CMD ["npm", "start"]
```

### 🔄 CI/CD Pipeline Flow

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    - Lint Python code (flake8, black)
    - Run unit tests (pytest)
    - Test frontend build
    
  build:
    - Build Docker images
    - Tag with commit SHA
    - Push to registry
    
  deploy:
    - Deploy frontend to Netlify
    - Deploy backend to Render
    - Run smoke tests
```

---

## 🛠️ Complete Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Backend
- **Framework:** FastAPI (async/await)
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** JWT + bcrypt
- **LLM:** Groq (LLaMA 3.3 70B)
- **RAG Framework:** LangChain
- **Vector DB:** ChromaDB
- **Embeddings:** HuggingFace (all-MiniLM-L6-v2)
- **PDF Parser:** PyPDF2
- **API Docs:** Swagger/OpenAPI
- **Testing:** pytest, unittest
- **Linting:** flake8, black

</td>
<td valign="top" width="50%">

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** JavaScript/TypeScript
- **HTTP Client:** Fetch API
- **State:** React Hooks
- **Auth:** JWT token management
- **Routing:** Next.js middleware
- **Testing:** Jest, React Testing Library

</td>
</tr>
<tr>
<td valign="top" width="50%">

### DevOps & Infrastructure
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Frontend Hosting:** Netlify
- **Backend Hosting:** Render
- **Version Control:** Git + GitHub
- **Config Management:** .env files
- **Monitoring:** GitHub Actions logs

</td>
<td valign="top" width="50%">

### AI/ML Stack
- **LLM Provider:** Groq (10x faster inference)
- **Model:** LLaMA 3.3 (70B parameters)
- **RAG Framework:** LangChain
- **Vector Store:** ChromaDB (persistent)
- **Embeddings:** sentence-transformers
- **Prompt Engineering:** Custom templates
- **Context Management:** Token optimization

</td>
</tr>
</table>

---

## 📦 Project Structure

```
JobAI/
├── .github/
│   └── workflows/
│       ├── deploy.yml                 # CI/CD pipeline configuration
│       ├── test.yml                   # Automated testing workflow
│       └── docker-build.yml           # Docker image build automation
│
├── backend/
│   ├── Dockerfile                     # Backend container configuration
│   ├── .dockerignore                  # Docker build exclusions
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   │   ├── auth.py               # Authentication endpoints
│   │   │   ├── resume.py             # Resume scanner API
│   │   │   └── email.py              # Email writer API
│   │   ├── core/
│   │   │   ├── security.py           # JWT & password hashing
│   │   │   └── config.py             # Environment configuration
│   │   ├── db/
│   │   │   ├── database.py           # SQLite connection
│   │   │   └── session.py            # DB session management
│   │   ├── langchain/
│   │   │   └── resume_analyzer.py    # RAG pipeline implementation
│   │   ├── models/
│   │   │   └── user.py               # SQLAlchemy models
│   │   ├── schemas/
│   │   │   ├── user.py               # Pydantic schemas
│   │   │   └── email.py              # Email schemas
│   │   ├── services/
│   │   │   ├── auth_service.py       # Business logic
│   │   │   ├── resume_service.py     # Resume processing
│   │   │   └── email_service.py      # Email generation
│   │   └── main.py                   # FastAPI app entry point
│   ├── tests/                        # Unit & integration tests
│   ├── requirements.txt              # Python dependencies
│   └── .env.example                  # Environment template
│
├── frontend/
│   ├── Dockerfile                    # Frontend container configuration
│   ├── .dockerignore                 # Docker build exclusions
│   ├── app/
│   │   ├── authentication/
│   │   │   ├── login/page.js        # Login UI
│   │   │   └── signup/page.js       # Registration UI
│   │   ├── components/
│   │   │   ├── Navbar.js            # Navigation component
│   │   │   ├── ProtectedRoute.js    # Auth middleware
│   │   │   └── AuthForm.js          # Reusable form component
│   │   ├── email-writer/page.js     # Email Writer interface
│   │   ├── resume-screener/page.js  # Resume Scanner interface
│   │   └── page.js                  # Landing page
│   ├── public/screenshots/          # Documentation images
│   ├── next.config.mjs              # Next.js configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── package.json                 # Node dependencies
│   └── .env.local.example           # Frontend env template
│
├── docker-compose.yml               # Multi-container orchestration
├── netlify.toml                     # Netlify deployment config
├── render.yaml                      # Render deployment config
├── .gitignore                       # Git exclusions
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended for easy setup)
- Python 3.9+ (if running without Docker)
- Node.js 18+ (if running without Docker)
- Groq API Key ([Get it here](https://console.groq.com/))

---

## 🐳 Quick Start with Docker (Recommended)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/prateekmtri/Resume-Scanner.git
cd Resume-Scanner
```

### 2️⃣ Configure Environment Variables

Create `.env` file in root directory:

```env
# Backend Configuration
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./jobai.db

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3️⃣ Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services will be available at:**
- Frontend: `http://localhost:3000` 🎉
- Backend API: `http://localhost:8000` 🎉
- API Documentation: `http://localhost:8000/docs` 📚

### 4️⃣ Docker Commands Cheat Sheet

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Start specific service
docker-compose up backend
docker-compose up frontend

# View running containers
docker-compose ps

# Execute commands in container
docker-compose exec backend bash
docker-compose exec frontend sh

# Remove all containers and volumes
docker-compose down -v

# View resource usage
docker stats
```

---

## 💻 Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install LangChain HuggingFace
pip install -U langchain-huggingface

# Create required folders
mkdir temp

# Configure .env file (see above)

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local

# Run development server
npm run dev
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Our automated CI/CD pipeline ensures code quality and seamless deployments:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest flake8 black
      - name: Lint with flake8
        run: |
          cd backend
          flake8 app --max-line-length=100
      - name: Format check with black
        run: |
          cd backend
          black --check app
      - name: Run tests
        run: |
          cd backend
          pytest tests/ -v

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Build
        run: |
          cd frontend
          npm run build
      - name: Run tests
        run: |
          cd frontend
          npm test

  build-and-push:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t jobai-backend:${{ github.sha }} ./backend
          docker build -t jobai-frontend:${{ github.sha }} ./frontend
      - name: Tag as latest
        run: |
          docker tag jobai-backend:${{ github.sha }} jobai-backend:latest
          docker tag jobai-frontend:${{ github.sha }} jobai-frontend:latest

  deploy-frontend:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}

  deploy-backend:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Deployment Configuration

#### Netlify Configuration (`netlify.toml`)

```toml
[build]
  base = "frontend/"
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
  NEXT_PUBLIC_API_URL = "https://jobai-backend.onrender.com"
```

#### Render Configuration (`render.yaml`)

```yaml
services:
  - type: web
    name: jobai-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: GROQ_API_KEY
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: DATABASE_URL
        value: sqlite:///./jobai.db
```

---

## 📸 Screenshots

<div align="center">

### 🔐 Authentication Flow

<table>
<tr>
<td width="50%">
<img src="./frontend/public/screenshots/signup.png" alt="Sign Up"/>
<p align="center"><b>Secure Registration</b></p>
</td>
<td width="50%">
<img src="./frontend/public/screenshots/login.png" alt="Login"/>
<p align="center"><b>User Authentication</b></p>
</td>
</tr>
</table>

### 🏠 Main Interface

![Home Page](./frontend/public/screenshots/home.png)
*Modern, responsive landing page with feature overview*

### 📄 Resume Scanner

<table>
<tr>
<td width="50%">
<img src="./frontend/public/screenshots/upload.png" alt="Upload"/>
<p align="center"><b>Drag & Drop Upload</b></p>
</td>
<td width="50%">
<img src="./frontend/public/screenshots/result.png" alt="Results"/>
<p align="center"><b>AI-Powered Analysis</b></p>
</td>
</tr>
</table>

### ✉️ Email Writer

![Email Writer](./frontend/public/screenshots/email-writer.png)
*Professional email generation with customization options*

</div>

---

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/api/v1/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

#### POST `/api/v1/auth/login`
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:** Same as signup response

### Resume Scanner Endpoints

#### POST `/api/v1/resume/upload`
Upload PDF resume and receive AI analysis. **Requires Authentication.**

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Response:**
```json
{
  "feedback": "Your resume demonstrates strong technical skills..."
}
```

### Email Writer Endpoints

#### POST `/api/v1/email/generate`
Generate professional job application email. **Requires Authentication.**

**Request:**
```json
{
  "topic": "Application for Senior Software Engineer",
  "tone": "professional",
  "length": "medium"
}
```

**Response:**
```json
{
  "email": "Dear Hiring Manager,\n\nI am writing to...",
  "subject": "Application for Senior Software Engineer Position"
}
```

**Interactive Docs:** Visit `http://localhost:8000/docs` for full Swagger UI

---

## 🔐 Security & Best Practices

### Security Features
✅ JWT-based authentication with token expiration  
✅ bcrypt password hashing (cost factor: 12)  
✅ Protected API routes with middleware  
✅ CORS configuration for production  
✅ Environment variable management  
✅ SQL injection prevention (SQLAlchemy ORM)  
✅ Rate limiting on authentication endpoints  
✅ Secure file upload validation  

### DevOps Best Practices
✅ Multi-stage Docker builds (reduced image size)  
✅ .dockerignore for optimized builds  
✅ Health check endpoints  
✅ Automated testing in CI pipeline  
✅ Environment-based configuration  
✅ Persistent volume management  
✅ Container orchestration with Docker Compose  
✅ Zero-downtime deployments  

### Code Quality
✅ Type hints (Python)  
✅ Pydantic validation schemas  
✅ API versioning (v1)  
✅ Clean architecture (layered design)  
✅ Error handling and logging  
✅ Code linting (flake8, black)  
✅ Unit test coverage  

---

## 🎯 Use Cases

### For Job Seekers
✅ Secure account for progress tracking  
✅ Instant AI-powered resume feedback  
✅ Professional email generation  
✅ ATS optimization insights  
✅ Career development tracking  

### For Students
✅ Learn professional communication  
✅ Build career readiness skills  
✅ Practice resume writing  
✅ Prepare for internships  

### For Recruiters
✅ Quick candidate assessment  
✅ Streamlined communication  
✅ Consistent messaging  
✅ Bulk resume analysis  

---

## 🧠 AI & RAG Architecture

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **LLM** | Groq LLaMA 3.3 (70B) | Resume analysis & email generation |
| **Embeddings** | all-MiniLM-L6-v2 | Semantic text vectorization |
| **Vector DB** | ChromaDB | Efficient similarity search |
| **RAG Framework** | LangChain | Document retrieval orchestration |
| **Chunking** | RecursiveCharacterTextSplitter | Semantic text segmentation |
| **Prompt Engineering** | Custom Templates | Optimized AI responses |

### RAG Pipeline Flow

```
Resume Upload → PDF Parsing → Text Chunking → 
Vector Embedding → ChromaDB Storage → 
Query Processing → Similarity Search → 
Context Retrieval → LLM Generation → 
Structured Feedback
```

---

## 🌟 Why This Project Stands Out

### Technical Excellence
✅ **Production-Grade DevOps** - Full CI/CD with Docker & GitHub Actions  
✅ **Cloud-Native Architecture** - Containerized microservices  
✅ **Advanced RAG Implementation** - Industry-standard vector search  
✅ **Secure Authentication** - JWT + bcrypt with SQLite persistence  
✅ **Ultra-Fast AI** - Groq provides 10x faster LLM inference  
✅ **Scalable Design** - Horizontal scaling ready  
✅ **API-First Approach** - RESTful with OpenAPI docs  
✅ **Clean Architecture** - Layered design with separation of concerns  

### Professional Portfolio Value
✅ **Full-Stack Proficiency** - Python, FastAPI, Next.js, TypeScript  
✅ **GenAI Expertise** - LangChain, RAG, vector databases, prompt engineering  
✅ **DevOps Skills** - Docker, CI/CD, cloud deployment, IaC  
✅ **Database Management** - ORM, migrations, data modeling  
✅ **Security Implementation** - Authentication, authorization, encryption  
✅ **Real-World Application** - Solves actual career problems  
✅ **Enterprise Patterns** - Scalable, maintainable, testable code  

**Perfect for demonstrating comprehensive software engineering & AI/ML expertise!** 💼

---

## 🚀 Performance Metrics

- **API Response Time:** < 200ms (excluding LLM calls)
- **LLM Inference:** < 2s (Groq optimization)
- **Docker Build Time:** ~3 minutes (multi-stage optimization)
- **CI/CD Pipeline:** ~5 minutes (parallel jobs)
- **Image Size:** 
  - Backend: ~300MB (optimized)
  - Frontend: ~200MB (optimized)

---

## 🔮 Future Enhancements

### Features
- [ ] User dashboard with analytics
- [ ] Resume version history
- [ ] Multi-language support
- [ ] LinkedIn profile optimization
- [ ] Cover letter generation
- [ ] Interview prep assistant
- [ ] ATS score calculator

### Infrastructure
- [ ] Kubernetes deployment
- [ ] PostgreSQL migration
- [ ] Redis caching layer
- [ ] ElasticSearch integration
- [ ] Prometheus monitoring
- [ ] Grafana dashboards
- [ ] Load balancer setup
- [ ] Auto-scaling policies

### AI/ML
- [ ] Fine-tuned models
- [ ] Multi-modal RAG (images)
- [ ] Semantic caching
- [ ] Model A/B testing
- [ ] Feedback loop system

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the Project
2. Create Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit Changes (`git commit -m 'Add AmazingFeature'`)
4. Push to Branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

**Code Standards:**
- Follow PEP 8 (Python)
- Use ESLint (JavaScript/TypeScript)
- Write unit tests for new features
- Update documentation

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Prateek Mani Tripathi**  
*Full-Stack Developer | GenAI Engineer | DevOps Enthusiast*

- 🌐 GitHub: [@prateekmtri](https://github.com/prateekmtri)
- 📧 Email: prateek1tri2@gmail.com
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/prateekmtri)
- 🚀 Portfolio: https://new-advance-portfolio.vercel.app/

---

## 🙏 Acknowledgments

- [Groq](https://groq.com/) - Lightning-fast LLM inference
- [LangChain](https://www.langchain.com/) - RAG framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework for production
- [Docker](https://www.docker.com/) - Containerization platform
- [GitHub Actions](https://github.com/features/actions) - CI/CD automation
- [Netlify](https://www.netlify.com/) - Frontend hosting
- [Render](https://render.com/) - Backend hosting

---

## ⭐ Show Your Support

If you found this project helpful, please give it a **star** ⭐  
It helps others discover this project!

---

<div align="center">

### 🚀 Built with Modern DevOps + GenAI Stack 🤖

**JobAI - Where AI Meets Career Success**

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=prateekmtri.Resume-Scanner)
![GitHub Stars](https://img.shields.io/github/stars/prateekmtri/Resume-Scanner?style=social)
![GitHub Forks](https://img.shields.io/github/forks/prateekmtri/Resume-Scanner?style=social)

</div>