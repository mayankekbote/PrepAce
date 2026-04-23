# PrepAce: AI-Powered Interview Engine 🚀

PrepAce is a modern, full-stack platform designed to replace static interview prep with dynamic, AI-driven simulations. It analyzes your resume, extracts your core projects and skills, and generates tailored technical interview questions using the latest LLM models.

## 🏗️ Project Architecture

The platform is built using a three-tier microservice-inspired architecture:

1.  **Frontend**: React + Vite + Tailwind CSS (Port `5173`)
2.  **Backend**: Spring Boot + PostgreSQL (Port `8085`)
3.  **AI Service**: Python + FastAPI + Groq (Llama 3.3) (Port `8000`)

---

## 🛠️ Setup & Installation

### 1. AI Service (Python)
This service handles PDF parsing and AI analysis via Groq.

```bash
cd ai_service
# Create a virtual environment
python -m venv venv
# Activate it (Windows)
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
```

**Configuration**:
Create a `.env` file in the `ai_service` folder:
```env
GROQ_API_KEY=your_groq_api_key_here
```

**Run**:
```bash
python main.py
```

### 2. Backend (Spring Boot)
Handles user authentication, file storage, and acts as a bridge to the AI service.

**Prerequisites**:
- Java 17+
- PostgreSQL (Database: `prepace_db`)

**Configuration**:
Update `src/main/resources/application.properties` with your DB credentials.

**Run**:
```bash
mvn spring-boot:run
```

### 3. Frontend (React)
A premium, responsive UI for interacting with the platform.

```bash
cd frontend
npm install
```

**Run**:
```bash
npm run dev
```

---

## 🚀 Key Features

- **Live Resume Analysis**: Upload a PDF and watch the AI extract your projects and tech stack in real-time.
- **Tailored Question Generation**: Exactly 3 deep-dive questions generated per resume, focusing on implementation, design, and trade-offs.
- **Glassmorphic UI**: A premium, "Tech-Noir" inspired design with smooth animations and grayish-black aesthetics.
- **Secure Bridge**: Java-to-Python multipart file transfer with JWT-protected endpoints.

## 🎨 Design System
The app uses a curated **Lighter Grayish Black** palette:
- **Primary Background**: `#0c0c0e`
- **Secondary/Card**: `#16161a`
- **Accent**: `#D9FF00` (Cyber Lime)

---

Developed with ❤️ for Advanced Technical Preparation.
