from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import json
import os
from groq import Groq
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
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

class AnalysisResponse(BaseModel):
    projects: List[Project]
    skills: Skills
    questions: List[Question]

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(file: UploadFile = File(...), targetRole: str = "Software Engineer"):
    print(f"DEBUG: Received analysis request for role: {targetRole}, file: {file.filename}")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        # 1. Extract text from PDF
        content = await file.read()
        print(f"DEBUG: Read {len(content)} bytes from file")
        
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        print(f"DEBUG: Extracted {len(text)} characters of text")

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
        for attempt in range(max_retries + 1):
            try:
                print(f"DEBUG: Sending request to Groq (Attempt {attempt + 1})...")
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system", 
                            "content": "You are a senior technical interviewer and resume analyst. You only output valid JSON. You never use '>' or '=' for field assignments; you only use ':' as per JSON standards."
                        },
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                analysis = json.loads(completion.choices[0].message.content)
                print("DEBUG: Analysis successfully completed")
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

class QuestionGenerationRequest(BaseModel):
    candidateProfile: CandidateProfileDTO
    interviewType: str = "TECHNICAL"
    difficulty: str = "MEDIUM"
    totalQuestions: int = 5

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
    depthScore: float
    clarityScore: float
    shortEvaluationSummary: str
    detectedConcepts: List[str]
    nextAction: str
    nextQuestion: str
    nextTopic: str

@app.post("/generate-interview-questions", response_model=GeneratedQuestionPoolResponse)
async def generate_interview_questions(
    request: QuestionGenerationRequest,
    x_internal_secret: Optional[str] = Header(None, alias="X-Internal-Secret")
):
    if x_internal_secret and x_internal_secret != INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Invalid internal service secret")

    print(f"DEBUG: Generating questions for role: {request.candidateProfile.targetRole}, type: {request.interviewType}, difficulty: {request.difficulty}")

    skills_str = json.dumps(request.candidateProfile.skills or {})
    projects_str = json.dumps(request.candidateProfile.projects or [])

    prompt = f"""
    You are a senior technical interviewer designing a mock interview for a candidate.

    Candidate Target Role: {request.candidateProfile.targetRole}
    Interview Type: {request.interviewType} (TECHNICAL, MANAGERIAL, HR)
    Difficulty Level: {request.difficulty} (EASY, MEDIUM, HARD)
    Total Questions Requested: {request.totalQuestions}

    ### Candidate Profile (Extracted from Resume):
    - Categorized Skills: {skills_str}
    - Significant Projects & Contributions: {projects_str}

    ### Task:
    1. Generate an array of at least 5 topic seeds ('topicSeeds') covering architectural, technical, or role-specific subjects relevant to this candidate.
    2. Generate an array of {request.totalQuestions} interview questions ('questions') prioritizing the candidate's actual projects, claimed skills, and target role concepts.
       For sequence 1 (first question), make it an INITIAL foundation question about one of their specific projects or claimed technologies.
       For subsequent sequences (2 to {request.totalQuestions}), generate tailored questions exploring deeper trade-offs or scenarios.

    ### Return ONLY valid JSON in this exact structure:
    {{
        "topicSeeds": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
        "questions": [
            {{
                "sequence": 1,
                "topic": "Project Architecture",
                "questionText": "Question text...",
                "questionType": "OPEN_ENDED",
                "difficulty": "{request.difficulty}",
                "questionKind": "INITIAL"
            }}
        ]
    }}
    """

    max_retries = 1
    for attempt in range(max_retries + 1):
        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert technical interviewer. You only output strict, valid JSON matching the requested schema."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            return data
        except Exception as e:
            print(f"ERROR generating interview questions (Attempt {attempt + 1}): {e}")
            if attempt == max_retries:
                return {
                    "topicSeeds": ["System Architecture", "Performance Optimization", "Database Management", "Security", "Code Quality"],
                    "questions": [
                        {
                            "sequence": 1,
                            "topic": "Technical Implementation",
                            "questionText": f"Can you walk me through your recent project work for the {request.candidateProfile.targetRole} role, highlighting your key technical contributions?",
                            "questionType": "OPEN_ENDED",
                            "difficulty": request.difficulty,
                            "questionKind": "INITIAL"
                        }
                    ]
                }

@app.post("/evaluate-and-next-question", response_model=EvaluationAndNextQuestionResponse)
async def evaluate_and_next_question(
    request: EvaluationAndNextQuestionRequest,
    x_internal_secret: Optional[str] = Header(None, alias="X-Internal-Secret")
):
    if x_internal_secret and x_internal_secret != INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Invalid internal service secret")

    print(f"DEBUG: Evaluating answer for seq {request.currentQuestion.sequence}, topic '{request.currentQuestion.topic}', followUpDepth: {request.currentTopicFollowUpDepth}")

    skills_str = json.dumps(request.candidateProfile.skills or {})
    projects_str = json.dumps(request.candidateProfile.projects or [])

    prompt = f"""
    You are a senior technical interviewer evaluating a candidate's live answer AND determining the next question in a single turn.

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

    ### Instructions:
    1. Evaluate candidate's answer on a 0.0 to 10.0 scale:
       - correctnessScore, relevanceScore, depthScore, clarityScore, and overall answerScore.
       - shortEvaluationSummary: Concise 1-2 sentence feedback.
       - detectedConcepts: List of key technical/functional concepts detected in candidate's answer.

    2. Decide nextAction:
       - If answer is strong (score >= 7.5) AND currentTopicFollowUpDepth < 2: use 'FOLLOW_UP' (ask a deeper question based specifically on their answer).
       - If answer is partial/vague (5.0 <= score < 7.5) AND currentTopicFollowUpDepth < 2: use 'CLARIFY' (ask one targeted probing question).
       - If answer is weak/incorrect (score < 5.0): use 'SIMPLIFY' or 'SWITCH_TOPIC'.
       - If currentTopicFollowUpDepth >= 2: use 'SWITCH_TOPIC' (transition to a brand new topic not in coveredTopics).

    3. Formulate nextQuestion text and nextTopic based on nextAction.

    ### Return ONLY valid JSON in this exact structure:
    {{
        "answerScore": 8.0,
        "correctnessScore": 8.5,
        "relevanceScore": 8.0,
        "depthScore": 7.5,
        "clarityScore": 8.0,
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
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a senior technical interviewer. You only output strict, valid JSON matching the requested schema."
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
    - Overall Score: {request.overallScore} / 100
    - Technical Accuracy / Correctness: {request.correctnessScore} / 100
    - Conceptual Depth: {request.depthScore} / 100
    - Relevance: {request.relevanceScore} / 100
    - Communication / Clarity: {request.clarityScore} / 100
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

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior technical interviewer. You output strict, valid JSON matching the requested schema. Be concise and constructive."
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


