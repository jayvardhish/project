from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from typing import List, Optional
import os
import uuid
import shutil
import base64
from datetime import datetime
from database import get_database
from bson import ObjectId
from routers.auth import get_current_user
from models import UserResponse
from ai_client import client
from ocr_utils import get_reader

router = APIRouter(prefix="/api/ocr", tags=["OCR"])

UPLOAD_DIR = "uploads/ocr"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Helper Functions ---

async def perform_vision_ocr(content: bytes, mime_type: str, mode: str) -> str:
    """Uses AI Vision to extract text from an image with layout awareness."""
    if not client:
        return ""
    
    base64_image = base64.b64encode(content).decode('utf-8')
    
    # Mode-based prompt engineering
    if mode == "structured":
        system_prompt = "You are an expert OCR system specialized in handwritten documents. Your priority is preserving the structural layout (columns, lists, headers)."
        user_prompt = "Transcribe this handwritten page. Maintain the original layout. If there are columns, use a clear text representation of them. Output ONLY the transcribed text."
    elif mode == "clean":
        system_prompt = "You are an expert OCR system focused on readability and flow."
        user_prompt = "Convert this handwritten note into clean, professional digital text. Correct spelling mistakes and format it for high readability. Output ONLY the transcribed text."
    else: # default
        system_prompt = "You are an accurate OCR system for handwritten text."
        user_prompt = "Please accurately transcribe all handwritten text in this image. Do not add any commentary. Output ONLY the text found."

    try:
        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-001", 
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}
                        }
                    ]
                }
            ],
            max_tokens=client.default_max_tokens
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Vision OCR Error: {e}")
        return ""

# --- Endpoints ---

@router.post("/upload")
async def recognize_handwriting(
    file: UploadFile = File(...),
    mode: str = Form("default"),
    current_user: UserResponse = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported for OCR.")
    
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
    
    # 1. Read & Save File
    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    try:
        # 2. Try High-Fidelity Vision OCR first
        text = await perform_vision_ocr(content, file.content_type, mode)
        
        # 3. Fallback to Local OCR if Vision fails or returns empty
        if not text:
            print("OCR Detail: Vision failed or returned empty. Falling back to local EasyOCR.")
            reader = get_reader()
            results = reader.readtext(file_path)
            text = " ".join([res[1] for res in results])
        
        if not text:
            text = "No legible text could be extracted from this image."

        # 4. Store in Database
        db = await get_database()
        ocr_doc = {
            "_id": file_id,
            "user_id": current_user.id,
            "title": file.filename,
            "text": text,
            "image_path": file_path,
            "type": "handwriting",
            "mode": mode,
            "created_at": datetime.utcnow()
        }
        await db.ocr.insert_one(ocr_doc)
        
        return {
            "id": file_id,
            "text": text,
            "mode": mode
        }
        
    except Exception as e:
        print(f"OCR Pipeline Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image OCR.")

@router.get("/history")
async def get_ocr_history(current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    # Using 'ocr' collection as per previous logic, but ensuring it's queried by user
    history = await db.ocr.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    for item in history:
        item["_id"] = str(item["_id"])
    return history

@router.delete("/{ocr_id}")
async def delete_ocr_item(
    ocr_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = await get_database()
    
    ocr_filter = {"user_id": current_user.id}
    try:
        ocr_filter["_id"] = ObjectId(ocr_id)
    except:
        ocr_filter["_id"] = ocr_id

    result = await db.ocr.delete_one(ocr_filter)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="OCR record not found.")
    return {"status": "success"}
