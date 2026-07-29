# PrepAce: Comprehensive AI-Powered Mock Interview Platform & Authentication Engine

> **Notice for AI Models & LLMs**: This document serves as the complete technical context, architecture blueprint, data model specification, and developer guide for the **PrepAce** codebase. Read this document to instantly understand the system architecture, file structure, API endpoints, design system, and key implementation decisions.

---

## 📍 1. Executive Summary

**PrepAce** is a modern, 3-tier microservice-inspired platform that replaces static interview preparation with dynamic, AI-driven mock technical simulations. It parses candidate resumes (PDFs), extracts project details and core technical skills, and utilizes Groq's LLM (`llama-3.3-70b-versatile`) to generate tailored technical interview questions focused on architectural trade-offs, implementation details, and optimizations.

---

## 🏗️ 2. System Architecture & Ports

The platform consists of three main decoupled services:

```
┌────────────────────────────────┐         ┌────────────────────────────────┐         ┌────────────────────────────────┐
│   React 19 Frontend (Vite)     │  HTTP   │   Java Spring Boot 3 Backend   │  HTTP   │   Python FastAPI AI Service    │
│   Tailwind CSS v4              ├────────►│   Spring Security 6 + JPA      ├────────►│   Groq LLM (Llama 3.3 70B)     │
│   Port: 5173                   │         │   Port: 8085                       │         │   Port: 8000                       │
└────────────────────────────────┘         └───────────────┬────────────────┘         └────────────────────────────────┘
                                                           │
                                                           ▼
                                                ┌─────────────────────┐
                                                │   PostgreSQL DB     │
                                                │   Database: prepace_db│
                                                │   Port: 5432        │
                                                └─────────────────────┘
```

| Service | Technology | Port | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Framer Motion | `5173` | Interactive dark-mode user web interface |
| **Backend** | Java Spring Boot 3.2.5, Spring Security 6, Spring Data JPA | `8085` | Authentication, user management, file storage, AI gateway |
| **AI Service** | Python 3, FastAPI, PyPDF2, Groq SDK | `8000` | PDF text extraction & LLM resume analysis/question generation |
| **Database** | PostgreSQL | `5432` | Relational database (`prepace_db`) |

---

## 📂 3. Project Directory Structure

```
c:/MockInterview Platform/
├── README.md                          # Project introduction & quickstart
├── PROJECT_CONTEXT.md                 # Complete AI & developer context reference
├── ai_service/                        # Python FastAPI AI Microservice
│   ├── main.py                        # FastAPI endpoints, PyPDF2 text extraction, Groq LLM integration
│   ├── requirements.txt               # Dependencies: fastapi, uvicorn, PyPDF2, groq, pydantic, python-dotenv
│   └── .env                           # GROQ_API_KEY
├── backend/                           # Spring Boot Java Backend
│   ├── pom.xml                        # Maven dependencies (Spring Boot 3.2.5, Security, JPA, Mail, OAuth2, JJWT)
│   ├── uploads/resumes/               # Local file storage for candidate PDF resumes
│   └── src/main/
│       ├── resources/
│       │   └── application.properties # DB connection, server.port=8085, JWT secret, SMTP credentials, Google client ID
│       └── java/com/prepace/auth/
│           ├── PrepaceApplication.java # Spring Boot entrypoint
│           ├── config/
│           │   ├── ApplicationConfig.java     # AuthManager, PasswordEncoder, UserDetailsService beans
│           │   ├── JwtAuthenticationFilter.java # Stateless JWT filter
│           │   └── SecurityConfig.java          # Spring Security 6 filter chain, CORS policy
│           ├── controller/
│           │   ├── AuthController.java # /api/auth/* endpoints (register, login, google, forgot/reset password)
│           │   ├── UserController.java # /api/user/* endpoints (profile, update details/resume, AI analysis bridge)
│           │   └── FileController.java # /api/files/* endpoints (download user resumes)
│           ├── dto/
│           │   ├── ApiResponse.java            # Standardized API response wrapper <T>
│           │   ├── AuthResponse.java           # JWT token, email, fullName return object
│           │   ├── CompleteProfileRequest.java # Profile setup request
│           │   ├── ForgotPasswordRequest.java  # Password reset request DTO
│           │   ├── LoginRequest.java           # Login credentials DTO
│           │   ├── RegisterRequest.java        # Registration details DTO
│           │   └── ResetPasswordRequest.java   # Token reset request DTO
│           ├── entity/
│           │   └── User.java                   # JPA entity mapping to PostgreSQL 'users' table
│           ├── repository/
│           │   └── UserRepository.java         # Spring Data JPA repository for User entity
│           └── service/
│               ├── AiAnalysisService.java     # RestTemplate proxy to Python FastAPI AI service
│               ├── AuthService.java           # Registration, login, Google OAuth, password reset logic
│               ├── EmailService.java           # Spring Mail Google SMTP welcome & reset emails
│               ├── FileService.java            # Resume PDF file upload/retrieval management
│               └── JwtService.java             # JJWT token generation, signing, and verification
└── frontend/                          # React 18 / 19 Single Page Application
    ├── package.json                   # React, Vite, @tailwindcss/vite, Framer Motion, Lucide, Axios
    ├── vite.config.js                 # Vite config with @tailwindcss/vite plugin
    ├── src/
    │   ├── main.jsx                   # Entrypoint rendering App with GoogleOAuthProvider
    │   ├── App.jsx                    # React Router routes & auth guards
    │   ├── index.css                  # Tailwind CSS v4 configuration (@import "tailwindcss"; @theme tokens)
    │   ├── context/
    │   │   └── AuthContext.jsx        # Auth state context, localStorage JWT storage, Axios interceptors
    │   ├── services/
    │   │   └── api.js                 # Axios instance pointing to http://localhost:8085/api
    │   ├── components/
    │   │   ├── Layout.jsx             # App layout wrapper with navbar & scanlines
    │   │   ├── Sidebar.jsx            # Authenticated navigation sidebar
    │   │   ├── ResumeDropzone.jsx     # Drag-and-drop PDF file uploader component
    │   │   ├── PasswordStrengthBar.jsx # Visual password complexity indicator
    │   │   └── UI.jsx                 # Glassmorphic cards, buttons, badges
    │   └── pages/
    │       ├── LoginPage.jsx          # Traditional & Google OAuth login
    │       ├── RegisterPage.jsx       # 2-Step interactive registration with resume upload
    │       ├── CompleteProfilePage.jsx# Post-register profile completion
    │       ├── Dashboard.jsx          # Overview of user target role, experience, resume status
    │       ├── ResumeAnalysisPage.jsx # AI extraction visualization (projects, skills, questions)
    │       ├── InterviewPrepPage.jsx  # Interactive question practice view
    │       ├── UpdateDetailsPage.jsx  # Profile info editor
    │       ├── UpdateResumePage.jsx   # Resume PDF replacement page
    │       ├── ForgotPasswordPage.jsx # Password reset request form
    │       ├── ResetPasswordPage.jsx  # Token-based new password submission
    │       └── VerifyEmailPage.jsx    # Email verification status page
```

---

## 🗄️ 4. Data Model & Database Schema

### Database Details: PostgreSQL (`prepace_db`)
Default User: `postgres`, Password: `admin`, Port: `5432`

#### `users` Table Schema

| Column Name | Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, Auto-generated | Unique user identifier |
| `full_name` | `VARCHAR(100)` | NOT NULL | User's full name |
| `email` | `VARCHAR(150)` | UNIQUE, NOT NULL | User's email address |
| `password_hash` | `VARCHAR` | NULLABLE | BCrypt hashed password (strength 12) |
| `phone_number` | `VARCHAR(20)` | NULLABLE | Contact phone number |
| `linkedin_url` | `VARCHAR` | NULLABLE | LinkedIn profile link |
| `github_url` | `VARCHAR` | NULLABLE | GitHub profile link |
| `target_role` | `VARCHAR(100)` | NULLABLE | Desired role (e.g. Full Stack Engineer) |
| `experience_level` | `VARCHAR(50)` | NULLABLE | Candidate level (Entry, Mid, Senior) |
| `resume_url` | `VARCHAR(500)` | NULLABLE | Relative path to local uploaded PDF |
| `resume_filename` | `VARCHAR` | NULLABLE | Original filename of uploaded PDF |
| `profile_picture` | `VARCHAR(500)` | NULLABLE | User profile image URL |
| `auth_provider` | `VARCHAR(20)` | Default `'LOCAL'` | `'LOCAL'` or `'GOOGLE'` |
| `google_id` | `VARCHAR` | NULLABLE | Google OAuth Subject ID |
| `is_email_verified`| `BOOLEAN` | Default `false` | Email verification flag |
| `reset_token` | `VARCHAR` | NULLABLE | Password reset token |
| `reset_token_expiry`| `TIMESTAMP` | NULLABLE | Expiration time for reset token |
| `created_at` | `TIMESTAMP` | Created Date (Auditing) | Account creation timestamp |
| `updated_at` | `TIMESTAMP` | Last Modified Date | Last update timestamp |

---

## 📡 5. Complete API Reference

### Backend Service (`http://localhost:8085/api`)

#### Authentication (`/api/auth`)
- `POST /api/auth/register` (Multipart/form-data)
  - Params: `fullName`, `email`, `password`, `phoneNumber`, `linkedinUrl`, `githubUrl`, `targetRole`, `experienceLevel`, `resume` (PDF file).
  - Output: `ApiResponse<AuthResponse>` containing JWT token & user info.
- `POST /api/auth/login` (JSON)
  - Body: `{ "email": "...", "password": "..." }`
  - Output: `ApiResponse<AuthResponse>`
- `POST /api/auth/google` (JSON)
  - Body: `{ "idToken": "..." }` (Verifies Google IdToken server-side via Google API Client)
- `POST /api/auth/forgot-password` (JSON)
  - Body: `{ "email": "..." }` (Sends reset email link via Google SMTP)
- `POST /api/auth/reset-password` (JSON)
  - Body: `{ "token": "...", "newPassword": "..." }`
- `GET /api/auth/verify-email?token=xxx`
  - Verifies email token.

#### User Profile & AI Analysis (`/api/user`) [Protected with JWT Header]
- `GET /api/user/me`
  - Returns current user details.
- `PUT /api/user/complete-profile`
  - Body: `{ "phoneNumber", "linkedinUrl", "githubUrl", "targetRole", "experienceLevel" }`
- `PUT /api/user/update-details`
  - Updates profile details.
- `POST /api/user/update-resume` (Multipart)
  - Replaces user resume PDF.
- `GET /api/user/analyze-resume`
  - Fetches the saved PDF resume for the current user, forwards it via multipart request to Python AI Service (`http://localhost:8000/analyze`), and returns structured JSON analysis.

#### File Serving (`/api/files`)
- `GET /api/files/resume/{userId}`
  - Downloads user resume PDF file.

#### Candidate Interview Session Management (`/api/interviews`) [Protected with JWT Header]
- `POST /api/interviews` (JSON)
  - Body: `{ "targetRole": "Backend Engineer", "interviewType": "TECHNICAL", "difficulty": "HARD", "totalQuestions": 5, "durationMinutes": 45 }`
  - Output: `ApiResponse<InterviewStateResponse>` (creates session in `CREATED` state with initial question generated)
- `POST /api/interviews/{sessionId}/start`
  - Output: `ApiResponse<InterviewStateResponse>` (transitions to `IN_PROGRESS`, sets `startedAt` & active question sequence to 1)
- `GET /api/interviews/{sessionId}`
  - Output: `ApiResponse<InterviewStateResponse>` (fetches active session state, current question, previous answers & evaluations, and final result if completed)
- `POST /api/interviews/{sessionId}/answer` (JSON)
  - Body: `{ "answerText": "I implemented a redis cache with LRU eviction strategy...", "audioUrl": null }`
  - Output: `ApiResponse<InterviewStateResponse>` (evaluates candidate answer, records score/feedback, advances question index, or auto-completes session if target question count reached)
- `POST /api/interviews/{sessionId}/complete`
  - Output: `ApiResponse<InterviewStateResponse>` (manually completes session and generates `InterviewResult`)
- `POST /api/interviews/{sessionId}/abandon`
  - Output: `ApiResponse<InterviewStateResponse>` (transitions status to `ABANDONED`)
- `GET /api/interviews`
  - Output: `ApiResponse<List<InterviewSessionResponse>>` (lists all interview sessions for logged-in candidate)

---

### Python AI Service (`http://localhost:8000`)

- `POST /analyze` (Multipart)
  - Form field: `file` (PDF)
  - Query param: `targetRole` (string, default: `"Software Engineer"`)
  - Response JSON structure:
    ```json
    {
      "projects": [
        {
          "title": "String",
          "techStack": ["String"],
          "contributions": ["String", "String", "String"],
          "impact": "String"
        }
      ],
      "skills": {
        "languages": ["String"],
        "frameworks": ["String"],
        "tools": ["String"]
      },
      "questions": [
        {
          "id": 1,
          "category": "implementation details",
          "title": "Technical Implementation",
          "text": "String",
          "hint": "String"
        }
      ]
- `POST /generate-interview-questions` (JSON)
  - Header: `X-Internal-Secret: prepace-internal-secret-2026`
  - Body:
    ```json
    {
      "candidateProfile": {
        "targetRole": "Backend Engineer",
        "skills": { "languages": ["Java"], "frameworks": ["Spring Boot"], "tools": ["PostgreSQL"] },
        "projects": [{ "title": "PrepAce", "techStack": ["Spring Boot"], "contributions": ["Built JWT auth"] }]
      },
      "interviewType": "TECHNICAL",
      "difficulty": "HARD",
      "totalQuestions": 5
    }
    ```
  - Response:
    ```json
    {
      "topicSeeds": ["System Design", "Database Optimization", "Security"],
      "questions": [
        {
          "sequence": 1,
          "topic": "Project Architecture",
          "questionText": "Can you describe the microservice architecture...",
          "questionType": "OPEN_ENDED",
          "difficulty": "HARD",
          "questionKind": "INITIAL"
        }
      ]
    }
    ```

---

## 🎨 6. Design System & Frontend Styling

The frontend utilizes **Tailwind CSS v4** configured with `@tailwindcss/vite` plugin and theme variables defined in `frontend/src/index.css`.

### Color Palette (Tech-Noir / Cyber Lime Theme)
- **Primary Background**: `#0A0A0A` (`--color-primary`)
- **Secondary / Card Background**: `#111111` (`--color-secondary`), `#1A1A1A` (`--color-card`)
- **Accent Color**: `#CCFF00` / `#D9FF00` (`--color-accent`, Cyber Lime)
- **Hover Accent**: `#AADD00` (`--color-accent-hover`)
- **Error / Danger**: `#FF4444` (`--color-error`)
- **Success**: `#00FF88` (`--color-success`)
- **Border / Divider**: `#2A2A2A` (`--color-border`)
- **Typography**:
  - Headings: `Space Grotesk`, sans-serif (`--font-space`)
  - Body: `DM Sans`, sans-serif (`--font-dm`)

### Special UI Textures
- **Scanline Texture**: `.scanline-overlay` overlay class providing an retro tech CRT monitor texture.
- **Dot Grid Background**: `.dot-grid` utility.
- **Glassmorphism**: Backdrop blur with translucent border styling.

---

## 🛠️ 7. Key Technical Refactors & Conventions

1. **No Lombok in Backend (Java 25 Compatibility)**:
   - The backend explicitly avoids `@Data`, `@Getter`, `@Setter`, and `@Builder` annotations from Lombok to prevent compiler failures under newer JDK versions (such as Java 25).
   - All entities, DTOs, and services use explicit Java boilerplate (Getters, Setters, Constructors, and static inner Builder classes).

2. **Decoupled Security Beans (No Circular Dependency)**:
   - Beans for `AuthenticationManager`, `PasswordEncoder`, and `UserDetailsService` are housed inside `com.prepace.auth.config.ApplicationConfig`.
   - `SecurityConfig` purely defines the `SecurityFilterChain` and CORS configurations.

3. **Tailwind CSS v4 Configuration**:
   - The frontend uses `@tailwindcss/vite` without `tailwind.config.js` or `postcss.config.js`.
   - All theme overrides are defined inside `@theme` block in `src/index.css`.

4. **File Storage Strategy**:
   - PDF Resumes are saved locally under `backend/uploads/resumes/` using UUID-based directory naming (`uploads/resumes/{userId}/resume.pdf`).

---

## 🧠 8. Candidate Interview Session Domain Architecture

### Entities & Relationships
- `InterviewSession` (`@ManyToOne User`, `@OneToMany InterviewQuestion`, `@OneToOne InterviewResult`): Tracks session status (`CREATED`, `IN_PROGRESS`, `COMPLETED`, `ABANDONED`), target role, interview type (`TECHNICAL`, `MANAGERIAL`, `HR`), difficulty (`EASY`, `MEDIUM`, `HARD`), duration, current question index, total questions, and optimistic lock `@Version`.
- `InterviewQuestion` (`@ManyToOne InterviewSession`, `@OneToOne CandidateAnswer`): Sequence, topic, question text, difficulty, and question kind (`INITIAL`, `FOLLOW_UP`, `FALLBACK`, `TOPIC_SWITCH`).
- `CandidateAnswer` (`@OneToOne InterviewQuestion`, `@ManyToOne InterviewSession`, `@OneToOne QuestionEvaluation`): Stores candidate response text, optional audio transcript URL, and submission timestamp.
- `QuestionEvaluation` (`@OneToOne CandidateAnswer`): Evaluation scores (overall score, clarity, correctness, depth), detailed feedback, and improvement hints.
- `InterviewResult` (`@OneToOne InterviewSession`): Overall session score, feedback summary, candidate strengths, weaknesses, and total questions answered.

### State Machine Lifecycle Rules
1. `CREATED`: Session instantiated with target parameters and initial question generated.
2. `IN_PROGRESS`: Triggered via `/start`. Active question sequence set to 1, `startedAt` timestamp recorded.
3. `/answer`: Evaluates response via `AiEngineClient`, persists `CandidateAnswer` and `QuestionEvaluation`, advances question index, and generates next contextual question. Auto-completes when `currentQuestionIndex == totalQuestions`.
4. `COMPLETED`: Finalized via auto-completion or explicit `/complete`. Builds final `InterviewResult`. No further answers accepted.
5. `ABANDONED`: Triggered via `/abandon` or user exit. Session finalized without result.

### Decoupled AI Client Interface
- `AiEngineClient` interface defines methods for initial question generation, next question generation, answer evaluation, and final score calculation.
- `PlaceholderAiEngineClient` implementation provides deterministic responses ready to be replaced by FastAPI/Groq LLM streaming in future phases.

---

## ⚡ 9. Dynamic Conversational Interview Engine

### Architecture & Precedence
- **Session Start**: `POST /generate-interview-questions` generates Question 1 (`INITIAL`) + `topicSeeds` candidate topic roadmap.
- **Per-Turn Dynamic Execution**: `POST /evaluate-and-next-question` performs candidate answer evaluation AND next question generation in a **single Groq LLM call per turn**.
- **Shared Secret Security**: Spring Boot and FastAPI validate internal service authentication via `PREPACE_INTERNAL_SECRET` header (`X-Internal-Secret`).

### Decision Rules & Guardrails
- **Strong Answer (score >= 7.5)**: `nextAction = FOLLOW_UP` -> Generates deeper contextual question targeting candidate's specific response.
- **Partial/Vague Answer (5.0 <= score < 7.5)**: `nextAction = CLARIFY` -> Generates targeted probing question.
- **Weak/Incorrect Answer (score < 5.0)**: `nextAction = SIMPLIFY` / `SWITCH_TOPIC` -> Asks simpler concept question or switches topic.
- **Explicit Skip / "I don't know"**: Intercepted in Spring Boot with **0 LLM calls**. Instantly assigns 0/10 evaluation and selects next topic from `topicSeeds`.
- **Loop Prevention**: Spring Boot overrides LLM decisions if `MAX_FOLLOW_UP_DEPTH` (max 2 consecutive follow-ups per topic) is reached, forcing `SWITCH_TOPIC`.
- **Idempotent Answer Submission**: `@Transactional` check returns existing state if answer is re-submitted for an active question, preventing duplicate entity creation or double advancement.
- **Session Question Budget**: Every question presented increments `currentQuestionIndex` by 1. Reaching `totalQuestions` auto-completes the session.
- **Resilience & Fallback**: If FastAPI times out (> 8s) or fails, Spring Boot records the answer, tags `questionSource: PLACEHOLDER_FALLBACK`, selects next fallback question, and allows the session to continue cleanly.

### 🎙️ Speech-First Architecture Contract
- **Transcript Entry**: Frontend captures microphone speech, performs Speech-to-Text (STT) transcription, and sends the resulting text transcript to `POST /api/interviews/{sessionId}/answer` inside `SubmitAnswerRequest.answerText`.
- **`SPEECH` vs `TEXT` Representation**: `SubmitAnswerRequest` and `CandidateAnswer` entity track `InputMode` enum (`SPEECH`, `TEXT`) and optional `confidenceScore`. Default mode is `SPEECH`; `TEXT` is available for dev/testing and microphone fallback.
- **Provider Independence**: STT transcription and TTS audio synthesis are isolated entirely outside the backend LLM loop. Spring Boot and FastAPI process final transcript text, remaining 100% agnostic of specific STT/TTS provider technologies (e.g. Web Speech API, Whisper, ElevenLabs).
- **Frontend Integration Decoupling**: The React Interview Room captures microphone audio -> executes STT -> POSTs transcript to existing `submitAnswer` -> receives next question text -> renders and speaks question using TTS without requiring any state machine or backend modifications.

---

## 🎙️ 10. Candidate Voice Interview Room Architecture (Frontend)

### Component Hierarchy & Responsibilities
- `InterviewPrepPage.jsx`: Setup page for configuring target role, interview type (`TECHNICAL`, `MANAGERIAL`, `HR`), difficulty (`EASY`, `MEDIUM`, `HARD`), and question limit. Calls `interviewApi.createSession` -> `interviewApi.startSession` -> navigates to `/interview/:sessionId`.
- `InterviewRoomPage.jsx` (`/interview/:sessionId`): Primary candidate-facing voice room orchestrating state flow, session resume on refresh, and STT/TTS hooks.
- `InterviewProgress.jsx`: Header bar rendering session sequence index (`currentQuestionIndex / totalQuestions`), target role, focus type, difficulty badge, and End Interview button.
- `InterviewQuestionCard.jsx`: Card displaying current question text, topic, difficulty, TTS speaking indicator, Replay Audio button, and Stop Audio button.
- `VoiceAnswerPanel.jsx`: Controls microphone recording (Start/Stop), live audio pulse ring, input mode toggle (Voice <-> Text), and "I Don't Know / Skip" button.
- `TranscriptEditor.jsx`: Editable transcript box allowing candidates to review and fine-tune their transcript before submitting.

### Custom Speech Hooks & Provider Abstraction
- `useSpeechRecognition.js`: Custom React hook wrapping `webkitSpeechRecognition` / `SpeechRecognition` providing `isSupported`, `isListening`, `transcript`, `confidenceScore`, `startListening`, `stopListening`, `resetTranscript`, and `setTranscript`.
- `useSpeechSynthesis.js`: Custom React hook wrapping `window.speechSynthesis` providing `isSpeaking`, `speak(text, onEnd)`, `cancel()`, and `replay()`. Automatically cancels previous speech before speaking new text.

### Frontend State Machine Flow
```
[QUESTION_LOADING] (Fetch/Restore session state)
       │
       ▼
[INTERVIEWER_SPEAKING] (AI TTS reads question aloud; mic disabled)
       │
       ▼
[READY] (Question spoken; mic idle; candidate ready)
       │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
[LISTENING] (Mic active; transcribing)       [TEXT MODE] (Manual text)
       │                                               │
       ▼                                               ▼
[TRANSCRIPT_READY] (Review/edit transcript) ───────────┘
       │
       ▼
[SUBMITTING] (POST /api/interviews/{sessionId}/answer)
       │
       ▼
[QUESTION_LOADING] -> Next question arrives & TTS begins
```

### Error Recovery & Safety Rules
- **No Overlapping Speech**: Microphone cannot record while `isSpeaking` is true, preventing mic from capturing speaker audio output.
- **Page Refresh Resilience**: Page refresh on `/interview/:sessionId` executes `GET /api/interviews/{sessionId}/state` to restore current sequence, question text, and session status cleanly without re-generating initial questions.
- **Double-Click & Retries Protection**: Disables submit button while `submitting` is true; uses Spring Boot backend `@Transactional` idempotency.
- **Clean End Interview**: Triggering End Session opens a confirmation modal before executing `POST /api/interviews/{sessionId}/complete`.

---

## 📊 11. Final Interview Scoring, AI Feedback & Candidate Results Dashboard

### Architectural Flow & Principles
1. **Zero LLM Score Recalculation**: Numerical score aggregation is 100% deterministic, computed in Spring Boot directly from per-question stored evaluations (`QuestionEvaluation`).
2. **Single Optional LLM Call**: During session completion (`POST /api/interviews/{sessionId}/complete`), exactly ONE request is dispatched to Python FastAPI (`POST /generate-final-feedback`) containing a compact payload of structured scores, topic metrics, and question summaries to generate qualitative feedback.
3. **Resilient Fallback**: If Groq or FastAPI times out (> 8s) or returns an error, Spring Boot seamlessly generates deterministic qualitative feedback matching score bands and topic performance (`feedbackSource = "DETERMINISTIC_FALLBACK"`). Result generation never fails.
4. **Idempotency Guarantee**: Fetching `/api/interviews/{sessionId}/result` or re-calling `/complete` checks the database for an existing `InterviewResult`. If present, the persisted result is returned immediately with **0 Groq LLM calls**.

### Deterministic Scoring Formula & Performance Bands
- **Dimension Scores (0–100 scale)**:
  - Technical Accuracy / Correctness = `Avg(correctnessScore) * 10`
  - Conceptual Depth = `Avg(depthScore) * 10`
  - Question Relevance = `Avg(relevanceScore) * 10`
  - Communication & Clarity = `Avg(clarityScore) * 10`
- **Weighted Overall Score Formula**:
  $$\text{Overall Score} = (\text{Correctness} \times 0.35) + (\text{Depth} \times 0.25) + (\text{Relevance} \times 0.20) + (\text{Clarity} \times 0.20)$$
  *(Rounded to 1 decimal place and clamped between 0.0 and 100.0)*
- **Performance Label Bands (`PerformanceLabel` Enum)**:
  - `EXCELLENT`: Overall Score ≥ 85.0
  - `STRONG`: 70.0 ≤ Overall Score < 85.0
  - `COMPETENT`: 55.0 ≤ Overall Score < 70.0
  - `NEEDS_IMPROVEMENT`: Overall Score < 55.0

### Topic Performance & Strong / Weak Topic Rules
- **Strong Topics**: Any topic with average score ≥ 75.0%.
- **Weak Topics**: Any topic with average score < 60.0%. If no topic is < 60.0% and not all topics are ≥ 90.0%, the single lowest-scoring topic is selected as weak.
- **Skipped / Unanswered Questions**: Evaluated as 0/10 in `QuestionEvaluation`, increasing `totalSkipped` count and appropriately impacting average score calculations.

### Results API Endpoints
- `POST /api/interviews/{sessionId}/complete`: Completes session state, calculates scores, invokes single LLM feedback call (or fallback), persists `InterviewResult`, returns state.
- `GET /api/interviews/{sessionId}/result`: Fetches persisted result DTO. Returns **HTTP 409 Conflict** if session is not yet completed, and **HTTP 404 / 403** if unauthorized.

### Candidate Results Dashboard (`InterviewResultsPage.jsx`)
- **Route**: `/interview/:sessionId/result`
- **Theme**: Cyber-Lime tech-noir dark design system matching PrepAce aesthetic.
- **Sections**:
  1. **Interview Summary Banner**: Role, interview type, difficulty level, completed timestamp, answered vs. skipped counters.
  2. **Hero Score Card**: Prominent Overall Score `/ 100` with `PerformanceLabel` badge.
  3. **Core Performance Dimensions**: 4 visual progress bars for Correctness (35%), Depth (25%), Relevance (20%), and Clarity (20%).
  4. **Topic-Wise Breakdown**: Detailed grid with topic name, evaluated question count, score %, and strong/weak status pills.
  5. **Strengths & Growth Areas**: Two-column layout presenting evidence-based observations.
  6. **Executive AI Assessment & Study Roadmap**: Overall performance summary, step-by-step actionable recommendations, and recommended study topic chips.
  7. **Navigation Bar**: Buttons to Practice Again or Return to Dashboard.





