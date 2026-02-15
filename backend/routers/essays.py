from fastapi import APIRouter, Depends, HTTPException, Body
from database import get_database
from routers.auth import get_current_user
from models import UserResponse
from datetime import datetime
import os
import json
from ai_client import client

router = APIRouter(prefix="/api/essays", tags=["Essays"])

@router.post("/submit")
async def submit_essay(
    title: str = Body(...),
    content: str = Body(...),
    current_user: UserResponse = Depends(get_current_user)
):
    prompt = f"""
    Grade the following essay based on three criteria: Grammar, Structure, and Content. 
    Provide a score (0-10) for each and a detailed feedback summary with improvement suggestions.
    
    Essay Title: {title}
    Essay Content: {content}
    
    Format JSON:
    {{
      "grammar_score": 8,
      "structure_score": 7,
      "content_score": 9,
      "overall_score": 8,
      "feedback": "...",
      "suggestions": ["suggestion 1", "suggestion 2"]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a professional academic grader. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=client.default_max_tokens
        )
        
        grade_data = json.loads(response.choices[0].message.content)
        
        db = await get_database()
        essay_doc = {
            "user_id": current_user.id,
            "title": title,
            "content": content,
            "grade": grade_data,
            "created_at": datetime.utcnow()
        }
        
        result = await db.essays.insert_one(essay_doc)
        
        return {
            "id": str(result.inserted_id),
            "grade": grade_data
        }
    except Exception as e:
        print(f"Essay Grading Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to grade essay")

@router.get("/")
async def get_user_essays(current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    essays = await db.essays.find({"user_id": current_user.id}).to_list(100)
    for e in essays:
        e["_id"] = str(e["_id"])
    return essays
