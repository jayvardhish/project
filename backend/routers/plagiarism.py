from fastapi import APIRouter, Depends, HTTPException, Body
from database import get_database
from routers.auth import get_current_user
from models import UserResponse
from datetime import datetime
import os
import json
from ai_client import client

router = APIRouter(prefix="/api/plagiarism", tags=["Plagiarism"])

@router.post("/check")
async def check_plagiarism(
    content: str = Body(..., embed=True),
    current_user: UserResponse = Depends(get_current_user)
):
    prompt = f"""
    Analyze the following content for plagiarism or AI-generated characteristics. 
    Provide a similarity percentage and a report on potential sources or stylistic inconsistencies.
    
    Content: {content}
    
    Format JSON:
    {{
      "similarity_score": 15,
      "ai_probability": 80,
      "status": "caution/safe/flagged",
      "findings": [
        "stylistic consistency is low",
        "potential source: academic journals"
      ],
      "detailed_report": "..."
    }}
    """

    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a plagiarism detection expert. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=client.default_max_tokens
        )
        
        report = json.loads(response.choices[0].message.content)
        
        db = await get_database()
        check_doc = {
            "user_id": current_user.id,
            "content_preview": content[:100],
            "report": report,
            "created_at": datetime.utcnow()
        }
        await db.plagiarism_checks.insert_one(check_doc)
        
        return report
    except Exception as e:
        print(f"Plagiarism Check Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check plagiarism")
