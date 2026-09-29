from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import json
import os
from groq import Groq
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import base64
import cv2
import numpy as np
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found in environment variables!")
    
client = Groq(api_key=GROQ_API_KEY if GROQ_API_KEY else "dummy_key_for_testing")

class Project(BaseModel):
    title: str
    techStack: List[str]
    contributions: List[str]
    impact: str

class Skills(BaseModel):
    languages: List[str]
    frameworks: List[str]
    tools: List[str]

class Question(BaseModel):
    id: int
    category: str
    title: str
    text: str
    hint: str

import time

class TelemetryData(BaseModel):
    pdf_extraction_ms: float = 0.0
    llm_analysis_ms: float = 0.0
    total_ai_service_ms: float = 0.0
    file_size_bytes: int = 0
    character_count: int = 0

class AnalysisResponse(BaseModel):
    projects: List[Project]
    skills: Skills
    questions: List[Question]
    telemetry: Optional[TelemetryData] = None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(file: UploadFile = File(...), targetRole: str = "Software Engineer"):
    overall_start = time.perf_counter()
    print(f"DEBUG: Received analysis request for role: {targetRole}, file: {file.filename}")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        # 1. Extract text from PDF
        pdf_extract_start = time.perf_counter()
        content = await file.read()
        file_size = len(content)
        print(f"DEBUG: Read {file_size} bytes from file")
        
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        pdf_extract_end = time.perf_counter()
        pdf_extract_ms = (pdf_extract_end - pdf_extract_start) * 1000.0
        print(f"DEBUG: Extracted {len(text)} characters of text in {pdf_extract_ms:.2f} ms")

        # 2. Call Groq for analysis
        prompt = f"""
        Analyze the following resume text for a candidate applying for the role of '{targetRole}'.
        
        ### Resume Text:
        {text}
        
        ### Task:
        1. Extract all significant projects (at least 2). For each, provide:
           - title: string
           - techStack: array of strings
           - contributions: array of exactly 3 strings (key functional descriptions)
           - impact: string (a concise sentence about the result)
        2. Extract and categorize all skills into: languages, frameworks, tools.
        3. Generate exactly 3 tailored interview questions based on the projects.
           - Question 1: Easy Question to build foundation of project.
           - Question 2:Easy question which Focuses on backend architecture.
           - Question 3: Focus on challenges/optimization.
        
        ### Output Requirement:
        Return ONLY a JSON object. Ensure all keys and values use double quotes and are separated by colons. 
        DO NOT use arrows (>) or equals (=) for assignments.
        
        ### Expected JSON Structure:
        {{
            "projects": [
                {{
                    "title": "string",
                    "techStack": ["string"],
                    "contributions": ["string", "string", "string"],
                    "impact": "string"
                }}
            ],
            "skills": {{
                "languages": ["string"],
                "frameworks": ["string"],
                "tools": ["string"]
            }},
            "questions": [
                {{
                    "id": 1,
                    "category": "implementation details",
                    "title": "Technical Implementation",
                    "text": "string",
                    "hint": "string"
                }}
            ]
        }}
        """

        max_retries = 2
        llm_start = time.perf_counter()
        for attempt in range(max_retries + 1):
            try:
                print(f"DEBUG: Sending request to Groq (Attempt {attempt + 1})...")
                completion = client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=[
                        {
                            "role": "system", 
                            "content": "You are a senior technical interviewer and resume analyst. You only output valid JSON. You never use '>' or '=' for field assignments; you only use ':' as per JSON standards."
                        },
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                llm_end = time.perf_counter()
                llm_ms = (llm_end - llm_start) * 1000.0
                overall_ms = (llm_end - overall_start) * 1000.0
                
                analysis = json.loads(completion.choices[0].message.content)
                analysis["telemetry"] = {
                    "pdf_extraction_ms": round(pdf_extract_ms, 2),
                    "llm_analysis_ms": round(llm_ms, 2),
                    "total_ai_service_ms": round(overall_ms, 2),
                    "file_size_bytes": file_size,
                    "character_count": len(text)
                }
                print(f"DEBUG: Analysis successfully completed in {overall_ms:.2f} ms")
                return analysis
            except Exception as e:
                error_msg = str(e)
                if "json_validate_failed" in error_msg and attempt < max_retries:
                    print(f"DEBUG: JSON validation failed on Groq side, retrying... {error_msg}")
                    continue
                print(f"CRITICAL ERROR in Python AI Service: {error_msg}")
                raise HTTPException(status_code=500, detail=f"Analysis failed: {error_msg}")

    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR in Python AI Service: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Candidate Profile & Question Generation Models
INTERNAL_SECRET = os.getenv("PREPACE_INTERNAL_SECRET", os.getenv("INTERNAL_SECRET", "prepace-internal-secret-2026"))

class CandidateProfileDTO(BaseModel):
    targetRole: Optional[str] = "Software Engineer"
    skills: Optional[Dict[str, List[str]]] = None
    projects: Optional[List[Dict[str, Any]]] = None

class WeakQuestionDTO(BaseModel):
    topic: Optional[str] = None
    questionText: Optional[str] = None
    previousScore: Optional[float] = None

class QuestionGenerationRequest(BaseModel):
    candidateProfile: CandidateProfileDTO
    interviewType: str = "TECHNICAL"
    difficulty: str = "MEDIUM"
    totalQuestions: int = 5
    weakQuestionsToRetry: Optional[List[WeakQuestionDTO]] = []

class GeneratedQuestion(BaseModel):
    sequence: int
    topic: str
    questionText: str
    questionType: str = "OPEN_ENDED"
    difficulty: str = "MEDIUM"
    questionKind: str = "INITIAL"

class GeneratedQuestionPoolResponse(BaseModel):
    topicSeeds: List[str]
    questions: List[GeneratedQuestion]

class CurrentQuestionDTO(BaseModel):
    sequence: int
    topic: str
    questionText: str

class EvaluationAndNextQuestionRequest(BaseModel):
    currentQuestion: CurrentQuestionDTO
    candidateAnswer: str
    interviewType: str = "TECHNICAL"
    difficulty: str = "MEDIUM"
    targetRole: str = "Software Engineer"
    candidateProfile: CandidateProfileDTO
    coveredTopics: List[str] = []
    currentTopicFollowUpDepth: int = 0

class EvaluationAndNextQuestionResponse(BaseModel):
    answerScore: float
    correctnessScore: float
    relevanceScore: float
    depthScore: Optional[float] = 7.0
    clarityScore: float
    shortEvaluationSummary: str
    detectedConcepts: List[str]
    nextAction: str
    nextQuestion: str
    nextTopic: str

def get_system_persona(interview_type: str) -> str:
    itype = (interview_type or "TECHNICAL").upper()
    if itype == "HR":
        return (
            "You are an expert HR professional and talent acquisition partner responsible for conducting realistic HR interview rounds. "
            "You assess personality, communication, self-awareness, professionalism, motivation, cultural fit, work ethic, adaptability, "
            "decision-making, pressure handling, teamwork, conflict resolution, honesty, and career alignment. "
            "For freshers, you leverage academics, college projects, internships, and extracurriculars. "
            "For experienced candidates, you evaluate professional responsibilities, work ethic, and career transitions."
        )
    elif itype == "MANAGERIAL":
        return (
            "You are a seasoned Hiring Manager and Engineering Leader conducting a Managerial Round (MR) interview. "
            "You evaluate project ownership, accountability, leadership potential, teamwork, conflict resolution, decision-making under ambiguity, "
            "structured problem-solving, prioritization, time management, handling unrealistic deadlines, escalation vs independence, "
            "trade-offs between speed and quality, business impact, and stakeholder communication. "
            "You prioritize realistic behavioral and situational scenarios over theoretical textbook questions."
        )
    else:
        return (
            "You are a senior technical interviewer and principal architect evaluating technical depth, system architecture, "
            "code quality, algorithms, performance optimization, and engineering trade-offs."
        )

@app.post("/generate-interview-questions", response_model=GeneratedQuestionPoolResponse)
async def generate_interview_questions(
    request: QuestionGenerationRequest,
    x_internal_secret: Optional[str] = Header(None, alias="X-Internal-Secret")
):
    if x_internal_secret and x_internal_secret != INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Invalid internal service secret")

    print(
        f"DEBUG: Generating questions for role: {request.candidateProfile.targetRole}, "
        f"type: {request.interviewType}, difficulty: {request.difficulty}, "
        f"weakQuestionsCount: {len(request.weakQuestionsToRetry or [])}"
    )

    skills = request.candidateProfile.skills or {}
    projects = request.candidateProfile.projects or []
    skills_str = json.dumps(skills)
    projects_str = json.dumps(projects)
    itype = request.interviewType.upper()

    # ------------------------------------------------------------
    # Q1 IS DETERMINISTIC
    #
    # We do NOT ask the LLM to decide what the initial question is.
    # This guarantees that the first question is grounded in the
    # candidate's actual resume/project data.
    #
    # If weak questions exist, retry the strongest weak question.
    # Otherwise, build Q1 directly from the first resume project.
    # ------------------------------------------------------------

    weak_questions = request.weakQuestionsToRetry or []

    if weak_questions:
        top_weak = weak_questions[0]

        initial_question = (
            top_weak.questionText
            or f"Can you explain the work you did in your {top_weak.topic or 'previous project'}?"
        )
        initial_topic = top_weak.topic or "Previous Weak Area"
        initial_kind = "RETRY"

    elif itype == "TECHNICAL" and projects:
        project = projects[0]

        # Support both the current stored profile format and the
        # original resume-analysis format.
        project_name = (
            project.get("title")
            or project.get("name")
            or "your project"
        )

        tech_stack = project.get("techStack") or project.get("technologies") or []
        contributions = project.get("contributions") or []

        if isinstance(tech_stack, str):
            tech_stack = [tech_stack]

        if isinstance(contributions, str):
            contributions = [contributions]

        first_contribution = (
            contributions[0]
            if contributions
            else None
        )

        if first_contribution:
            initial_question = (
                f"In your {project_name}, you mentioned {first_contribution} "
                f"Can you walk me through how you implemented this and explain "
                f"your specific contribution?"
            )
        elif tech_stack:
            initial_question = (
                f"Can you walk me through your {project_name} project? "
                f"I see you used {', '.join(tech_stack[:4])}. "
                f"What was the problem you were solving, and what exactly did you build?"
            )
        else:
            initial_question = (
                f"Can you walk me through your {project_name} project, "
                f"including the problem it solved and your specific technical contribution?"
            )

        initial_topic = project_name
        initial_kind = "INITIAL"

    elif itype == "HR":
        initial_question = (
            f"To start, please walk me through your background and the experiences "
            f"that are most relevant to the {request.candidateProfile.targetRole} role."
        )
        initial_topic = "Introduction & Background Summary"
        initial_kind = "INITIAL"

    elif itype == "MANAGERIAL" and projects:
        project = projects[0]
        project_name = project.get("title") or project.get("name") or "your project"

        initial_question = (
            f"Let's start with your {project_name} project. "
            f"Can you describe what you were responsible for, the main challenge "
            f"you faced, and how you handled it?"
        )
        initial_topic = project_name
        initial_kind = "INITIAL"

    else:
        initial_question = (
            f"Can you walk me through your most significant technical project "
            f"and your specific contribution to it?"
        )
        initial_topic = "Project Experience"
        initial_kind = "INITIAL"

    if itype == "HR":
        type_specific_guidance = """
        ### HR Round Focus Guidelines:
        - Ask direct, natural behavioral questions.
        - For freshers, use college projects, internships, academics and learning experiences.
        - Avoid technical textbook questions.
        """
        default_topic_seeds = [
            "Introduction & Background Summary",
            "Company Fit & Career Motivation",
            "Strengths, Weaknesses & Self-Awareness",
            "Teamwork, Conflict & Problem Solving",
            "Pressure, Prioritization & Growth"
        ]

    elif itype == "MANAGERIAL":
        type_specific_guidance = """
        ### Managerial Round Focus Guidelines:
        - Focus on project ownership, accountability, teamwork, ambiguity,
          prioritization, deadlines, mistakes, decision-making and trade-offs.
        - Ground questions in the candidate's actual projects whenever possible.
        """
        default_topic_seeds = [
            "Project Ownership & Accountability",
            "Prioritization & Time Management",
            "Handling Ambiguity & Failure",
            "Conflict Resolution & Stakeholders",
            "Decision Making & Trade-offs"
        ]

    else:
        type_specific_guidance = """
        ### Technical Round Focus Guidelines:
        - Every question must be grounded in the candidate's actual resume.
        - Reference a concrete project, technology, framework, tool,
          contribution or implementation decision from the candidate profile.
        - Prefer WHY/HOW/implementation questions over textbook definitions.
        - Do not ask about technologies that are absent from the profile.
        - For project questions, use the actual project name.
        - For architecture questions, refer to the candidate's actual architecture
          or technology choices.
        - For optimization/debugging questions, identify a concrete component,
          bottleneck or implementation decision from the candidate's projects.
        """
        default_topic_seeds = [
            "Resume Project Architecture",
            "Technical Implementation",
            "Backend & API Design",
            "Performance & Optimization",
            "Debugging & Engineering Trade-offs"
        ]

    prompt = f"""
    {get_system_persona(itype)}

    Candidate Target Role: {request.candidateProfile.targetRole}
    Interview Focus Type: {request.interviewType}
    Difficulty Level: {request.difficulty} (EASY, MEDIUM, HARD)
    Total Questions Requested: {request.totalQuestions}

    ### Candidate Profile Extracted From Resume:
    - Categorized Skills: {skills_str}
    - Significant Projects & Contributions: {projects_str}

    {type_specific_guidance}

    ### CRITICAL RULES FOR QUESTIONS 2+
    1. Every question must be grounded in something actually present in the candidate profile.
    2. Every technical question must reference a concrete project, technology,
       framework, tool, contribution or implementation decision.
    3. Do not invent projects, technologies or contributions.
    4. Do not ask generic textbook questions when a resume-specific question is possible.
    5. Questions should sound like a real interviewer who has read the resume.
    6. Progress from implementation understanding to architecture, debugging,
       optimization and trade-offs.
    7. Use actual project names and technologies from the profile.
    8. If multiple projects exist, distribute questions across relevant projects.

    IMPORTANT:
    - Question 1 is ALREADY PROVIDED by the application.
    - DO NOT generate or replace Question 1.
    - Generate only questions for sequences 2 through {request.totalQuestions}.
    - Every generated question must be resume-specific.

    ### Task:
    Generate topic seeds and questions for sequences 2 through {request.totalQuestions}.

    ### Return ONLY valid JSON:
    {{
        "topicSeeds": {json.dumps(default_topic_seeds)},
        "questions": [
            {{
                "sequence": 2,
                "topic": "Resume-specific topic",
                "questionText": "Resume-specific question...",
                "questionType": "OPEN_ENDED",
                "difficulty": "{request.difficulty}",
                "questionKind": "FOLLOW_UP"
            }}
        ]
    }}
    """

    # Start with the guaranteed resume-based Q1.
    questions = [
        {
            "sequence": 1,
            "topic": initial_topic,
            "questionText": initial_question,
            "questionType": "OPEN_ENDED",
            "difficulty": request.difficulty,
            "questionKind": initial_kind
        }
    ]

    # If only one question is requested, there is nothing else to generate.
    if request.totalQuestions <= 1:
        return {
            "topicSeeds": default_topic_seeds,
            "questions": questions
        }

    max_retries = 1

    for attempt in range(max_retries + 1):
        try:
            completion = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            f"{get_system_persona(itype)} "
                            "You output strict, valid JSON matching the requested schema."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )

            data = json.loads(completion.choices[0].message.content)

            generated_questions = data.get("questions") or []

            # Never allow the LLM to overwrite Q1.
            # Also normalize sequences so the application receives Q2, Q3, ...
            normalized_questions = []

            for index, question in enumerate(generated_questions, start=2):
                if index > request.totalQuestions:
                    break

                question["sequence"] = index

                # The LLM-generated questions are not the deterministic initial question.
                if question.get("questionKind") == "INITIAL":
                    question["questionKind"] = "FOLLOW_UP"

                normalized_questions.append(question)

            questions.extend(normalized_questions)

            # If the model returned too few questions, fill the remaining
            # slots with deterministic resume-grounded questions.
            while len(questions) < request.totalQuestions:
                sequence = len(questions) + 1

                if projects:
                    project = projects[(sequence - 2) % len(projects)]
                    project_name = (
                        project.get("title")
                        or project.get("name")
                        or "your project"
                    )

                    tech_stack = project.get("techStack") or []
                    contributions = project.get("contributions") or []

                    if isinstance(tech_stack, str):
                        tech_stack = [tech_stack]

                    if isinstance(contributions, str):
                        contributions = [contributions]

                    if contributions:
                        fallback_question = (
                            f"In your {project_name}, how did you implement "
                            f"{contributions[(sequence - 2) % len(contributions)]}, "
                            f"and what technical trade-off did you have to consider?"
                        )
                    elif tech_stack:
                        fallback_question = (
                            f"In your {project_name}, how did you use "
                            f"{tech_stack[(sequence - 2) % len(tech_stack)]}, "
                            f"and what challenge did you face with it?"
                        )
                    else:
                        fallback_question = (
                            f"What was the most technically challenging part of "
                            f"your {project_name}, and how did you solve it?"
                        )

                    fallback_topic = project_name

                else:
                    fallback_question = (
                        f"What technical decision from your project work would "
                        f"you revisit today, and why?"
                    )
                    fallback_topic = "Project Technical Decisions"

                questions.append({
                    "sequence": sequence,
                    "topic": fallback_topic,
                    "questionText": fallback_question,
                    "questionType": "OPEN_ENDED",
                    "difficulty": request.difficulty,
                    "questionKind": "FOLLOW_UP"
                })

            return {
                "topicSeeds": data.get("topicSeeds") or default_topic_seeds,
                "questions": questions
            }

        except Exception as e:
            print(
                f"ERROR generating interview questions "
                f"(Attempt {attempt + 1}): {e}"
            )

            if attempt == max_retries:
                # Q1 is still valid even if the LLM fails.
                while len(questions) < request.totalQuestions:
                    sequence = len(questions) + 1

                    if projects:
                        project = projects[(sequence - 2) % len(projects)]
                        project_name = (
                            project.get("title")
                            or project.get("name")
                            or "your project"
                        )

                        fallback_question = (
                            f"What was the most technically challenging part of "
                            f"your {project_name}, and how did you solve it?"
                        )
                    else:
                        fallback_question = (
                            "What was the most challenging technical problem "
                            "you solved in your project work, and how did you solve it?"
                        )

                    questions.append({
                        "sequence": sequence,
                        "topic": project_name if projects else "Project Technical Decisions",
                        "questionText": fallback_question,
                        "questionType": "OPEN_ENDED",
                        "difficulty": request.difficulty,
                        "questionKind": "FOLLOW_UP"
                    })

                return {
                    "topicSeeds": default_topic_seeds,
                    "questions": questions
                }


@app.post("/evaluate-and-next-question", response_model=EvaluationAndNextQuestionResponse)
async def evaluate_and_next_question(
    request: EvaluationAndNextQuestionRequest,
    x_internal_secret: Optional[str] = Header(None, alias="X-Internal-Secret")
):
    if x_internal_secret and x_internal_secret != INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Invalid internal service secret")

    print(f"DEBUG: Evaluating answer for seq {request.currentQuestion.sequence}, topic '{request.currentQuestion.topic}', type: {request.interviewType}")

    skills_str = json.dumps(request.candidateProfile.skills or {})
    projects_str = json.dumps(request.candidateProfile.projects or [])
    itype = request.interviewType.upper()

    eval_focus_instructions = ""
    if itype == "HR":
        eval_focus_instructions = """
        - Evaluate response focusing on Communication & Clarity (clarityScore), Self-awareness & Role Alignment (relevanceScore), and Depth of Real Examples/Maturity (correctnessScore).
        - Probe deeper on vague/generic answers. If candidate provided strong response, follow up with a deeper behavioral scenario.
        """
    elif itype == "MANAGERIAL":
        eval_focus_instructions = """
        - Evaluate response focusing on Ownership & Accountability (correctnessScore), Structured Problem Solving & Decision Rationale (relevanceScore), and Clarity & Stakeholder Awareness (clarityScore).
        - Probe whether the candidate took personal responsibility vs shifting blame, and how they balanced trade-offs under constraints.
        """
    else:
        eval_focus_instructions = """
        - Evaluate response focusing on Technical Accuracy (correctnessScore), Technical Relevance (relevanceScore), and Engineering Clarity (clarityScore).
        """

    prompt = f"""
    {get_system_persona(itype)}

    Candidate Role: {request.targetRole}
    Interview Type: {request.interviewType} (TECHNICAL, MANAGERIAL, HR)
    Difficulty: {request.difficulty} (EASY, MEDIUM, HARD)

    ### Candidate Resume Context:
    - Skills: {skills_str}
    - Projects: {projects_str}

    ### Current Turn Context:
    - Question Sequence: {request.currentQuestion.sequence}
    - Question Topic: {request.currentQuestion.topic}
    - Question Text: "{request.currentQuestion.questionText}"
    - Candidate Answer: "{request.candidateAnswer}"
    - Covered Topics So Far: {json.dumps(request.coveredTopics)}
    - Current Topic Follow-up Depth: {request.currentTopicFollowUpDepth} (Max allowed depth is 2)

    ### Evaluation & Next Question Guidelines:
    1. Evaluate candidate's answer on a 0.0 to 10.0 scale:
       - correctnessScore (50% weight), relevanceScore (30% weight), clarityScore (20% weight).
       - overall answerScore = (correctnessScore * 0.50) + (relevanceScore * 0.30) + (clarityScore * 0.20).
       - shortEvaluationSummary: Concise 1-2 sentence feedback.
       - detectedConcepts: List of key behavioral, managerial, or technical concepts detected.

    2. Decide nextAction:
       - If answer is strong (score >= 7.5) AND currentTopicFollowUpDepth < 2: use 'FOLLOW_UP' (ask a deeper probing question on their specific scenario/decision).
       - If answer is partial/vague (5.0 <= score < 7.5) AND currentTopicFollowUpDepth < 2: use 'CLARIFY' (ask one targeted question forcing specific details).
       - If answer is weak/incorrect (score < 5.0): use 'SIMPLIFY' or 'SWITCH_TOPIC'.
       - If currentTopicFollowUpDepth >= 2: use 'SWITCH_TOPIC' (transition to a new topic not in coveredTopics).

    3. Formulate nextQuestion text and nextTopic aligned with the interview type ({request.interviewType}).
       Make the question sound natural, direct, and conversational.
       NEVER add robotic prefixes like "No problem, let's switch to another topic: ..." or "Can you walk me through your understanding of core concepts in ...".

    ### Return ONLY valid JSON in this exact structure:
    {{
        "answerScore": 8.3,
        "correctnessScore": 8.5,
        "relevanceScore": 8.0,
        "depthScore": 7.5,
        "clarityScore": 8.5,
        "shortEvaluationSummary": "Clear technical explanation.",
        "detectedConcepts": ["Concept 1", "Concept 2"],
        "nextAction": "FOLLOW_UP",
        "nextQuestion": "Next question text...",
        "nextTopic": "Topic Name"
    }}
    """

    max_retries = 1
    for attempt in range(max_retries + 1):
        try:
            completion = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {
                        "role": "system",
                        "content": f"{get_system_persona(itype)} You only output strict, valid JSON matching the requested schema."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            return data
        except Exception as e:
            print(f"ERROR in evaluate_and_next_question (Attempt {attempt + 1}): {e}")
            if attempt == max_retries:
                return {
                    "answerScore": 7.0,
                    "correctnessScore": 7.0,
                    "relevanceScore": 7.0,
                    "depthScore": 7.0,
                    "clarityScore": 7.0,
                    "shortEvaluationSummary": "Answer recorded successfully.",
                    "detectedConcepts": ["Technical Implementation"],
                    "nextAction": "SWITCH_TOPIC",
                    "nextQuestion": f"Let's move to a new topic for the {request.targetRole} role. Can you discuss your approach to system reliability?",
                    "nextTopic": "System Reliability"
                }

class TopicSummaryDTO(BaseModel):
    topic: str
    questionsAttempted: int
    averageScore: float
    status: str

class QuestionEvaluationSummaryDTO(BaseModel):
    sequence: int
    topic: str
    questionText: str
    score: float
    shortSummary: Optional[str] = None

class FinalFeedbackRequest(BaseModel):
    targetRole: str = "Software Engineer"
    interviewType: str = "TECHNICAL"
    difficulty: str = "MEDIUM"
    overallScore: float
    correctnessScore: float
    depthScore: float
    relevanceScore: float
    clarityScore: float
    totalAnswered: int
    totalSkipped: int
    strongestTopics: List[str] = []
    weakestTopics: List[str] = []
    topicPerformance: List[TopicSummaryDTO] = []
    questionSummaries: List[QuestionEvaluationSummaryDTO] = []

class FinalFeedbackResponse(BaseModel):
    overallPerformanceSummary: str
    keyStrengths: List[str]
    improvementAreas: List[str]
    actionableRecommendations: List[str]
    suggestedTopicsToStudy: List[str]

@app.post("/generate-final-feedback", response_model=FinalFeedbackResponse)
async def generate_final_feedback(
    request: FinalFeedbackRequest,
    x_internal_secret: Optional[str] = Header(None, alias="X-Internal-Secret")
):
    if x_internal_secret and x_internal_secret != INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Invalid internal service secret")

    print(f"DEBUG: Generating final feedback for role: {request.targetRole}, overallScore: {request.overallScore}")

    topics_summary_str = json.dumps([t.dict() for t in request.topicPerformance])
    q_summaries_str = json.dumps([q.dict() for q in request.questionSummaries])

    prompt = f"""
    You are a principal engineering interviewer providing concise, actionable feedback for a candidate who just finished a mock interview.

    ### Candidate Profile & Session Info:
    - Target Role: {request.targetRole}
    - Interview Focus: {request.interviewType}
    - Difficulty: {request.difficulty}

    ### Deterministic Performance Metrics:
    - Overall Score: {request.overallScore} / 100 (50% Correctness, 30% Relevance, 20% Clarity)
    - Technical Accuracy / Correctness (50% weight): {request.correctnessScore} / 100
    - Relevance (30% weight): {request.relevanceScore} / 100
    - Communication / Clarity (20% weight): {request.clarityScore} / 100
    - Questions Answered: {request.totalAnswered}
    - Questions Skipped / Unanswered: {request.totalSkipped}

    ### Topic Breakdown & Key Observations:
    - Strongest Topics: {json.dumps(request.strongestTopics)}
    - Weakest Topics: {json.dumps(request.weakestTopics)}
    - Detailed Topic Performance: {topics_summary_str}
    - Per-Question Evaluations: {q_summaries_str}

    ### Task:
    Generate structured, evidence-based, constructive qualitative feedback.
    1. 'overallPerformanceSummary': 2-3 concise sentences summarizing their performance relative to the target role.
    2. 'keyStrengths': Array of specific bullet points highlighting technical and communication strengths observed. CRITICAL RULE: If the candidate performed poorly, skipped questions, or demonstrated no technical strengths, DO NOT fabricate praise or fake strengths. Return an empty array [] if no genuine strengths were shown.
    3. 'improvementAreas': 3 specific bullet points highlighting areas needing growth.
    4. 'actionableRecommendations': 3 practical step-by-step advice items to improve before real interviews.
    5. 'suggestedTopicsToStudy': 3-5 specific technical subjects/concepts to master next.

    ### Return ONLY valid JSON in this exact structure:
    {{
        "overallPerformanceSummary": "Summary text...",
        "keyStrengths": ["Strength 1", "Strength 2"],
        "improvementAreas": ["Area 1", "Area 2", "Area 3"],
        "actionableRecommendations": ["Rec 1", "Rec 2", "Rec 3"],
        "suggestedTopicsToStudy": ["Topic 1", "Topic 2", "Topic 3"]
    }}
    """

    itype = (request.interviewType or "TECHNICAL").upper()

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": f"{get_system_persona(itype)} You output strict, valid JSON matching the requested schema. Be concise and constructive."
                },
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(completion.choices[0].message.content)
        return data
    except Exception as e:
        print(f"ERROR generating final feedback in Python AI Service: {e}")
        raise HTTPException(status_code=500, detail=f"Feedback generation failed: {str(e)}")


class ProctorFrameRequest(BaseModel):
    image_base64: str

class FaceDetectionDTO(BaseModel):
    x: int
    y: int
    w: int
    h: int

class ProctorFrameResponse(BaseModel):
    person_count: int
    no_person: bool
    multiple_persons: bool
    out_of_frame: bool
    faces: List[FaceDetectionDTO]
    engine: str = "OpenCV-HaarCascade"

# Initialize OpenCV cascades
haar_face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
haar_profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

@app.post("/proctor/detect-frame", response_model=ProctorFrameResponse)
async def detect_frame_opencv(request: ProctorFrameRequest):
    try:
        raw_data = request.image_base64
        if "," in raw_data:
            raw_data = raw_data.split(",")[1]

        img_bytes = base64.b64decode(raw_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return ProctorFrameResponse(
                person_count=0,
                no_person=True,
                multiple_persons=False,
                out_of_frame=True,
                faces=[]
            )

        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        # Detect frontal faces with higher minNeighbors to prevent false positives on background objects
        detected_faces = haar_face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=8,
            minSize=(50, 50)
        )

        # Fallback to profile face detector if no frontal faces found
        if len(detected_faces) == 0:
            detected_faces = haar_profile_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=10,
                minSize=(60, 60)
            )

        face_list = []
        out_of_frame = False

        for (x, y, w, h) in detected_faces:
            cx = x + w / 2.0
            cy = y + h / 2.0

            # Check if face center is near frame boundary (out of 5% - 95% range)
            if cx < 0.05 * width or cx > 0.95 * width or cy < 0.05 * height or cy > 0.95 * height:
                out_of_frame = True

            face_list.append(FaceDetectionDTO(x=int(x), y=int(y), w=int(w), h=int(h)))

        person_count = len(face_list)
        no_person = (person_count == 0) or out_of_frame

        return ProctorFrameResponse(
            person_count=person_count,
            no_person=no_person,
            multiple_persons=person_count > 1,
            out_of_frame=out_of_frame,
            faces=face_list,
            engine="OpenCV-HaarCascade"
        )
    except Exception as e:
        print(f"OpenCV detect frame error: {e}")
        return ProctorFrameResponse(
            person_count=0,
            no_person=True,
            multiple_persons=False,
            out_of_frame=True,
            faces=[]
        )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)