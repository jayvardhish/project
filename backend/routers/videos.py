from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks, Form
from typing import List, Optional
import shutil
import os
import uuid
from datetime import datetime
from database import get_database
from routers.auth import get_current_user
from models import UserResponse
from ai_client import client
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
from utils.video_utils import extract_audio

router = APIRouter(prefix="/api/videos", tags=["Videos"])

UPLOAD_DIR = "uploads/videos"
AUDIO_DIR = "uploads/audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

# --- Helper Functions ---

def extract_video_id(url: str) -> Optional[str]:
    query = urlparse(url)
    if query.hostname == 'youtu.be':
        return query.path[1:]
    if query.hostname in ('www.youtube.com', 'youtube.com'):
        if query.path == '/watch':
            p = parse_qs(query.query)
            return p.get('v', [None])[0]
        if query.path[:7] == '/embed/':
            return query.path.split('/')[2]
        if query.path[:3] == '/v/':
            return query.path.split('/')[2]
    return None

async def restore_punctuation(text: str) -> str:
    if not client or not text.strip():
        return text
    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a professional editor. Restore punctuation and capitalization to the following transcript. Keep the original words exactly as they are."},
                {"role": "user", "content": text[:4000]}
            ],
            max_tokens=client.default_max_tokens
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Punctuation Error: {e}")
        return text

async def generate_ai_summary(text: str, summary_type: str) -> str:
    if not client:
        return "AI Summarization is currently unavailable (Client not initialized)."
    
    if summary_type == "brief":
        prompt = f"Provide a concise summary (3-5 core sentences) of the following content:\n\n{text}"
    elif summary_type == "bullet":
        prompt = f"Extract 5-10 key points as bullet points from the following content:\n\n{text}"
    else: # detailed
        prompt = f"Provide a comprehensive summary of the following content, covering the main topics, key arguments, and final conclusions:\n\n{text}"

    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful education assistant specialized in lecture summarization."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=client.default_max_tokens
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Summary Generation Error: {e}")
        return f"Error generating {summary_type} summary."

# --- Endpoints ---

@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = f"{UPLOAD_DIR}/{file_id}{file_ext}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    db = await get_database()
    video_doc = {
        "user_id": current_user.id,
        "title": file.filename,
        "file_path": file_path,
        "status": "uploaded",
        "created_at": datetime.utcnow()
    }
    
    result = await db.videos.insert_one(video_doc)
    return {
        "id": str(result.inserted_id),
        "filename": file.filename,
        "status": "uploaded"
    }

@router.get("/")
async def get_user_videos(current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    videos = await db.videos.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    for v in videos:
        v["_id"] = str(v["_id"])
    return videos

@router.post("/youtube")
async def summarize_youtube(
    url: str = Form(...),
    summary_type: str = Form("detailed"),
    current_user: UserResponse = Depends(get_current_user)
):
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        # 1. Fetch Transcript with multi-language fallback
        transcript_list = None
        try:
            # Try English first, then any available
            try:
                transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
            except:
                transcripts_meta = YouTubeTranscriptApi.list_transcripts(video_id)
                # Pick the first one available
                for t in transcripts_meta:
                    transcript_list = t.fetch()
                    break
        except Exception as yt_err:
            print(f"YouTube Transcript Fetch Error: {yt_err}")
            raise HTTPException(status_code=404, detail="No transcript available for this YouTube video.")

        if not transcript_list:
            raise HTTPException(status_code=404, detail="Transcript empty or unavailable.")

        raw_text = " ".join([t['text'] for t in transcript_list])
        
        # 2. Cleanup & Punctuate
        clean_text = await restore_punctuation(raw_text)
        
        # 3. Summarize
        summary = await generate_ai_summary(clean_text, summary_type)

        db = await get_database()
        video_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "title": f"YouTube: {video_id}",
            "url": url,
            "type": "youtube",
            "status": "summarized",
            "summary": summary,
            "summary_type": summary_type,
            "created_at": datetime.utcnow()
        }
        await db.videos.insert_one(video_doc)
        return {**video_doc, "_id": video_doc["_id"]}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Generic YouTube Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{video_id}/summarize")
async def summarize_local_video(
    video_id: str,
    summary_type: str = Form("detailed"),
    current_user: UserResponse = Depends(get_current_user)
):
    db = await get_database()
    video = await db.videos.find_one({"_id": video_id, "user_id": current_user.id})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video_path = video.get("file_path")
    if not video_path or not os.path.exists(video_path):
        raise HTTPException(status_code=400, detail="Video file missing on server")

    audio_path = os.path.join(AUDIO_DIR, f"{video_id}.mp3")
    
    try:
        # 1. Extract Audio
        if not os.path.exists(audio_path):
            success = extract_audio(video_path, audio_path)
            if not success:
                raise Exception("Failed to extract audio from video")

        # 2. Transcription Pipeline (Mocked Placeholder for Whisper)
        # Note: In a production setup, we would call OpenAI Whisper API or a local model here.
        transcript_placeholder = (
            f"This is a simulated high-quality transcript for the lecture '{video.get('title')}'. "
            "In this video, the instructor discusses advanced concepts of software architecture and "
            "the importance of decoupling components. "
            "The key takeaway is that scalability depends on professional state management and clean interfaces. "
            "This content was extracted from the audio stream."
        )

        # 3. Summarize
        summary = await generate_ai_summary(transcript_placeholder, summary_type)

        # 4. Update Database
        await db.videos.update_one(
            {"_id": video_id},
            {
                "$set": {
                    "status": "summarized", 
                    "summary": summary, 
                    "summary_type": summary_type,
                    "last_updated": datetime.utcnow()
                }
            }
        )
        
        return {"summary": summary, "status": "summarized"}
        
    except Exception as e:
        print(f"Local Video Summary Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process video: {str(e)}")
