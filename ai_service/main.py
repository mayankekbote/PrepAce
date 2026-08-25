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

    print(f"DEBUG: Generating questions for role: {request.candidateProfile.targetRole}, type: {request.interviewType}, difficulty: {request.difficulty}, weakQuestionsCount: {len(request.weakQuestionsToRetry or [])}")

    skills_str = json.dumps(request.candidateProfile.skills or {})
    projects_str = json.dumps(request.candidateProfile.projects or [])
    itype = request.interviewType.upper()

    weak_questions_instruction = ""
    if request.weakQuestionsToRetry and len(request.weakQuestionsToRetry) > 0:
        weak_list_json = json.dumps([wq.model_dump() for wq in request.weakQuestionsToRetry])
        weak_questions_instruction = f"""
        ### Unanswered / Weak Questions from Candidate's Previous Tests (Score < 3.5 or Skipped):
        {weak_list_json}

        CRITICAL REQUIREMENT FOR SEQUENCE 1:
        The candidate struggled with or skipped the above question(s) in their past test.
        For sequence 1 (first question), you MUST re-ask or re-frame the top weak question from this list to check if they have improved.
        Set "questionKind": "RETRY" for sequence 1.
        """

    if itype == "HR":
        type_specific_guidance = """
        ### HR Round Focus Guidelines:
        - Generate questions that assess personality, communication, self-awareness, motivation, career goals, cultural fit, work ethic, adaptability, working under pressure, deadlines, failures, conflict with teammates, and feedback.
        - For freshers/early career: Incorporate college projects, internships, group activities, academic choices, and learning experiences.
        - For experienced candidates: Incorporate work history, career transitions, professional relationships, handling stress, and workplace ethics.
        - Focus on realistic behavioral and situational questions requiring specific actions and lessons learned.
        """
        default_topic_seeds = ["Career Motivation & Role Alignment", "Teamwork & Conflict Resolution", "Adaptability & Pressure Handling", "Ownership & Work Ethic", "Personal Growth & Feedback"]
        fallback_topic = "Career Motivation & Alignment"
        fallback_text = f"Welcome to your HR round for the {request.candidateProfile.targetRole} role. To start, can you introduce yourself and explain what motivated you to apply for this role and how your background fits?"

    elif itype == "MANAGERIAL":
        type_specific_guidance = """
        ### Managerial Round (MR) Focus Guidelines:
        - Generate questions focusing on project ownership, accountability, leadership potential, teamwork, decision-making under ambiguity, prioritization, handling tight deadlines, mistakes/failures, escalation vs independence, trade-offs between speed and quality, and stakeholder communication.
        - Create realistic workplace scenarios (e.g. scope changes, competing priorities, incomplete information, difficult teammates, trade-offs).
        - Evaluate whether the candidate takes responsibility vs shifting blame, knows when to act independently vs escalate, and communicates risks effectively.
        """
        default_topic_seeds = ["Project Ownership & Accountability", "Prioritization & Time Management", "Handling Ambiguity & Failure", "Conflict Resolution & Stakeholders", "Decision Making & Trade-offs"]
        fallback_topic = "Project Ownership & Accountability"
        fallback_text = f"Welcome to your Managerial Round for the {request.candidateProfile.targetRole} role. Can you describe a scenario where you took full ownership of a challenging deliverable under tight deadlines or changing requirements?"

    else: # TECHNICAL
        type_specific_guidance = """
        ### Technical Round Focus Guidelines:
        - Generate questions prioritizing technical implementation, system design, architectural trade-offs, performance optimization, and claimed skills/projects.
        """
        default_topic_seeds = ["System Architecture & Design", "Performance Optimization", "Database Management", "Security & Reliability", "Code Quality & Patterns"]
        fallback_topic = "Technical Architecture"
        fallback_text = f"Can you walk me through your recent project work for the {request.candidateProfile.targetRole} role, highlighting your key technical contributions?"

    prompt = f"""
    {get_system_persona(itype)}

    Candidate Target Role: {request.candidateProfile.targetRole}
    Interview Focus Type: {request.interviewType}
    Difficulty Level: {request.difficulty} (EASY, MEDIUM, HARD)
    Total Questions Requested: {request.totalQuestions}

    ### Candidate Profile (Extracted from Resume):
    - Categorized Skills: {skills_str}
    - Significant Projects & Contributions: {projects_str}

    {type_specific_guidance}
    {weak_questions_instruction}

    ### CRITICAL QUESTION QUALITY RULES:
    1. Write genuine, authentic, realistic interview questions as spoken by a senior human interviewer.
    2. NEVER include artificial prefixes, robotic headers, or generic template phrases such as "No problem, let's switch to another topic: ..." or "Can you walk me through your understanding of core concepts in ...".
    3. For HR: Ask direct, natural behavioral questions (e.g. tell me about yourself, strengths/weaknesses, teamwork conflicts, handling pressure/stress, motivation for the role, receiving criticism).
    4. For MANAGERIAL: Ask direct situational questions (e.g. project ownership under tight deadlines, handling scope ambiguity, balancing speed vs quality, handling mistakes, stakeholder alignment).
    5. For TECHNICAL: Ask direct architectural & engineering scenario questions based on their projects and claimed skills.

    ### Task:
    1. Generate an array of at least 5 relevant topic seeds ('topicSeeds').
    2. Generate an array of {request.totalQuestions} interview questions ('questions') tailored to the interview focus type ({request.interviewType}).
       If weak questions were provided above, sequence 1 MUST be a RETRY question ("questionKind": "RETRY"). Otherwise, sequence 1 is an INITIAL question.
       For subsequent sequences (2 to {request.totalQuestions}), generate tailored behavioral, situational, or technical trade-off questions.

    ### Return ONLY valid JSON in this exact structure:
    {{
        "topicSeeds": {json.dumps(default_topic_seeds)},
        "questions": [
            {{
                "sequence": 1,
                "topic": "{fallback_topic}",
                "questionText": "Question text...",
                "questionType": "OPEN_ENDED",
                "difficulty": "{request.difficulty}",
                "questionKind": "{"RETRY" if (request.weakQuestionsToRetry and len(request.weakQuestionsToRetry) > 0) else "INITIAL"}"
            }}
        ]
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
                        "content": f"{get_system_persona(itype)} You output strict, valid JSON matching the requested schema."
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
                fallback_kind = "INITIAL"
                if request.weakQuestionsToRetry and len(request.weakQuestionsToRetry) > 0:
                    top_weak = request.weakQuestionsToRetry[0]
                    fallback_topic = top_weak.topic or fallback_topic
                    fallback_text = top_weak.questionText or fallback_text
                    fallback_kind = "RETRY"

                return {
                    "topicSeeds": default_topic_seeds,
                    "questions": [
                        {
                            "sequence": 1,
                            "topic": fallback_topic,
                            "questionText": fallback_text,
                            "questionType": "OPEN_ENDED",
                            "difficulty": request.difficulty,
                            "questionKind": fallback_kind
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
       {eval_focus_instructions}
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
        "shortEvaluationSummary": "Clear explanation with strong evidence of ownership.",
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


