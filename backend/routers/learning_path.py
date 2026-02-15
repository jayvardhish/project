from fastapi import APIRouter, Depends, HTTPException
from database import get_database
from routers.auth import get_current_user
from models import UserResponse
from datetime import datetime
import os
import json
from ai_client import client

router = APIRouter(prefix="/api/learning-path", tags=["Learning Path"])

@router.get("/generate")
async def generate_path(
    category: str = "General Knowledge",
    current_user: UserResponse = Depends(get_current_user)
):
    db = await get_database()
    
    # Gather user performance data
    quizzes = await db.quizzes.find({"user_id": current_user.id}).to_list(10)
    essays = await db.essays.find({"user_id": current_user.id}).to_list(10)
    
    performace_summary = {
        "user": current_user.username,
        "focus_category": category,
        "quiz_count": len(quizzes),
        "essay_count": len(essays),
        "subjects": ["AI", "Math", "Literature"] # Simulated subjects
    }
    
    prompt = f"""
    Based on the user's performance summary and their chosen focus category '{category}', 
    generate a personalized learning roadmap with 4 phases tailored to that category. 
    Each phase should have a goal and 3 specific tasks.
    
    Performance Data: {json.dumps(performace_summary)}
    
    Format JSON:
    {{
      "title": "Your Custom Roadmap",
      "description": "...",
      "phases": [
        {{
          "title": "Phase 1: Foundation",
          "goal": "Master the basics",
          "tasks": ["Task 1", "Task 2", "Task 3"]
        }}
      ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": "You are an expert curriculum designer. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=client.default_max_tokens
        )
        
        path_data = json.loads(response.choices[0].message.content)
        
        # Save path
        await db.learning_paths.update_one(
            {"user_id": current_user.id},
            {"$set": {
                "path": path_data,
                "updated_at": datetime.utcnow()
            }},
            upsert=True
        )
        
        return path_data
    except Exception as e:
        print(f"Path Generation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate learning path")
