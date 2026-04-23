from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import json
import os
from groq import Groq
from pydantic import BaseModel
from typing import List, Dict
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
    
client = Groq(api_key=GROQ_API_KEY)

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
           - title
           - techStack (list of tools/languages)
           - contributions (list of 3 key functional bullets)
           - impact (a concise sentence about the result)
        2. Extract and categorize all skills into: languages, frameworks, tools.
        3. Generate exactly 3 tailored interview questions based on the projects.
           - Question 1: Focus on implementation details.
           - Question 2: Focus on design decisions/trade-offs.
           - Question 3: Focus on challenges/optimization.
        
        ### Output Format:
        Return ONLY a JSON object with the following structure:
        {{
            "projects": [{{ "title": "", "techStack": [], "contributions": [], "impact": "" }}],
            "skills": {{ "languages": [], "frameworks": [], "tools": [] }},
            "questions": [{{ "id": 1, "category": "", "title": "", "text": "", "hint": "" }}]
        }}
        """

        print("DEBUG: Sending request to Groq...")
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a senior technical interviewer and resume analyst."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        analysis = json.loads(completion.choices[0].message.content)
        print("DEBUG: Analysis successfully completed")
        return analysis

    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR in Python AI Service: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
