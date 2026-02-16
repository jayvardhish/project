from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from typing import List, Optional
import os
import uuid
from datetime import datetime
from database import get_database
from bson import ObjectId
from routers.auth import get_current_user
from models import UserResponse
from ai_client import client
import PyPDF2
import json

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])

UPLOAD_DIR = "uploads/docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# DeepSeek Client is imported as 'client'

def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    if ext == ".pdf":
        with open(file_path, "rb") as f:
            pdf = PyPDF2.PdfReader(f)
            for page in pdf.pages:
                text += page.extract_text()
    elif ext in [".txt", ".docx"]:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    return text

@router.post("/generate")
async def generate_quiz(
    file: Optional[UploadFile] = File(None),
    content: Optional[str] = Form(None),
    difficulty: str = Form("medium"),
    num_questions: int = Form(5),
    current_user: UserResponse = Depends(get_current_user)
):
    source_text = content or ""
    
    if file:
        file_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        file_path = f"{UPLOAD_DIR}/{file_id}{file_ext}"
        with open(file_path, "wb") as buffer:
            import shutil
            shutil.copyfileobj(file.file, buffer)
        source_text += extract_text(file_path)
    
    if not source_text:
        raise HTTPException(status_code=400, detail="No content provided")

    prompt = f"""
    Generate a JSON quiz based on this content. 
    Difficulty: {difficulty}
    Number of questions: {num_questions}
    
    Format:
    {{
      "title": "Quiz Title",
      "questions": [
        {{
          "question": "The question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option A",
          "explanation": "Brief explanation"
        }}
      ]
    }}
    
    Content: {source_text[:4000]}
    """

    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a specialized quiz generator. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=client.default_max_tokens
        )
        
        quiz_data = json.loads(response.choices[0].message.content)
        
        db = await get_database()
        quiz_doc = {
            "user_id": current_user.id,
            "title": quiz_data.get("title", "Untitled Quiz"),
            "questions": quiz_data.get("questions", []),
            "difficulty": difficulty,
            "created_at": datetime.utcnow()
        }
        
        result = await db.quizzes.insert_one(quiz_doc)
        
        return {
            "id": str(result.inserted_id),
            "title": quiz_doc["title"],
            "questions": quiz_doc["questions"]
        }
    except Exception as e:
        print(f"Quiz Generation Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@router.get("/")
async def get_user_quizzes(current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    quizzes = await db.quizzes.find({"user_id": current_user.id}).to_list(100)
    for q in quizzes:
        q["_id"] = str(q["_id"])
    return quizzes
