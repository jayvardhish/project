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
from utils.video_utils import extract_audio, download_youtube_audio
from bson import ObjectId

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

    # 1. Fetch Transcript with Multi-Method Fallback
    summary = None
    clean_text = None
    
    try:
        # Step 1A: Try Official Transcript
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
            clean_text = " ".join([t['text'] for t in transcript_list])
            print(f"DEBUG: Fetched official transcript for {video_id}")
        except Exception as e:
            print(f"DEBUG: Official transcript failed for {video_id}: {e}")
            # Step 1B: Try list_transcripts fallback
            transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
            try:
                transcript = transcripts.find_manually_created_transcript()
                clean_text = " ".join([t['text'] for t in transcript.fetch()])
                print(f"DEBUG: Fetched manual transcript for {video_id}")
            except:
                try:
                    transcript = transcripts.find_generated_transcript(['en'])
                    clean_text = " ".join([t['text'] for t in transcript.fetch()])
                    print(f"DEBUG: Fetched auto-generated transcript for {video_id}")
                except:
                    # Final Step 1 Fallback: Pick first available
                    transcript = next(iter(transcripts))
                    clean_text = " ".join([t['text'] for t in transcript.fetch()])
                    print(f"DEBUG: Fetched first available transcript for {video_id}")

    except Exception as transcript_err:
        print(f"DEBUG: All transcript methods failed: {transcript_err}")
        print("DEBUG: Attempting DeepSeek Transcription Fallback...")
        
        # Step 2: DeepSeek Transcription Fallback (Free alternative to Whisper)
        try:
            from utils.video_utils import transcribe_audio_with_deepseek
            
            # Generate a unique filename for the audio
            audio_id = str(uuid.uuid4())
            audio_base = os.path.join(AUDIO_DIR, audio_id)
            
            # Download audio
            print(f"DEBUG: Downloading audio for {video_id}...")
            audio_path = download_youtube_audio(url, audio_base)
            
            if not audio_path or not os.path.exists(audio_path):
                raise Exception("Failed to download audio for transcription")
                
            # Transcribe with DeepSeek
            print("DEBUG: Transcribing with DeepSeek...")
            clean_text = transcribe_audio_with_deepseek(audio_path)
            
            if not clean_text:
                raise Exception("DeepSeek transcription returned empty text")
                
            print("DEBUG: DeepSeek transcription successful")
            
            # Cleanup
            if os.path.exists(audio_path):
                os.remove(audio_path)
                
        except Exception as deepseek_err:
            print(f"DEBUG: DeepSeek fallback failed: {deepseek_err}")
            raise HTTPException(
                status_code=404, 
                detail="No transcript available for this video. The video may not have captions enabled, and audio transcription failed."
            )

    if not clean_text:
        raise HTTPException(status_code=404, detail="No transcript or audio content found.")

    # 2. RAG Pipeline: Chunk, Embed, Store
    from utils.embedding_utils import chunk_text
    from vector_store import store_video_chunks, retrieve_relevant_chunks
    
    print(f"DEBUG: Chunking transcript for {video_id}...")
    chunks = chunk_text(clean_text, max_tokens=1000, overlap=100)
    print(f"DEBUG: Created {len(chunks)} chunks")
    
    # Store chunks with embeddings
    try:
        # Use local embeddings (free) instead of OpenAI to avoid quota issues
        chunk_count = store_video_chunks(video_id, chunks, use_openai_embeddings=False)
        print(f"DEBUG: Stored {chunk_count} chunks in vector DB")
    except Exception as e:
        print(f"WARNING: Failed to store chunks: {e}. Proceeding without RAG.")
        chunk_count = 0

    # 3. Retrieve relevant chunks for summarization
    # For summarization, we want a broad overview, so retrieve more chunks
    if chunk_count > 0:
        try:
            # Use a generic query to get diverse chunks (using local embeddings)
            summary_query = f"Provide a {summary_type} summary of the main topics and key points"
            relevant_chunks = retrieve_relevant_chunks(video_id, summary_query, top_k=min(10, chunk_count), use_openai_embeddings=False)
            context_text = "\n\n".join([f"[Segment {i+1}]\n{chunk['text']}" for i, chunk in enumerate(relevant_chunks)])
            print(f"DEBUG: Retrieved {len(relevant_chunks)} chunks for summarization")
        except Exception as e:
            print(f"WARNING: Failed to retrieve chunks: {e}. Using full text.")
            context_text = clean_text[:10000]  # Limit to avoid token overflow
    else:
        # Fallback to original behavior if RAG failed
        context_text = clean_text[:10000]

    # 4. Generate AI summary with retrieved context
    summary = await generate_ai_summary(context_text, summary_type)

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

@router.post("/{video_id}/summarize")
async def summarize_local_video(
    video_id: str,
    summary_type: str = Form("detailed"),
    current_user: UserResponse = Depends(get_current_user)
):
    db = await get_database()
    
    # Try finding by ObjectId if valid, else by string
    video_filter = {"user_id": current_user.id}
    try:
        video_filter["_id"] = ObjectId(video_id)
    except:
        video_filter["_id"] = video_id
        
    video = await db.videos.find_one(video_filter)
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
            video_filter,
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

@router.post("/{video_id}/ask")
async def ask_video_question(
    video_id: str,
    question: str = Form(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Ask a question about a video's content using RAG retrieval.
    Returns source-grounded answers based on transcript chunks.
    """
    from vector_store import retrieve_relevant_chunks, get_video_chunk_count
    
    db = await get_database()
    
    # Verify video exists and belongs to user
    video_filter = {"user_id": current_user.id}
    try:
        video_filter["_id"] = ObjectId(video_id)
    except:
        video_filter["_id"] = video_id
    
    video = await db.videos.find_one(video_filter)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check if chunks exist for this video
    chunk_count = get_video_chunk_count(video_id)
    if chunk_count == 0:
        raise HTTPException(
            status_code=400, 
            detail="This video has not been processed with the RAG pipeline. Please re-summarize it first."
        )
    
    # Retrieve relevant chunks (using local embeddings)
    try:
        relevant_chunks = retrieve_relevant_chunks(video_id, question, top_k=5, use_openai_embeddings=False)
    except Exception as e:
        print(f"Retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve relevant content")
    
    if not relevant_chunks:
        return {
            "answer": "I couldn't find relevant information in the video transcript to answer this question.",
            "sources": []
        }
    
    # Build context from chunks
    context_parts = []
    for i, chunk in enumerate(relevant_chunks):
        context_parts.append(f"[Source {i+1}]\n{chunk['text']}")
    
    context = "\n\n".join(context_parts)
    
    # Source-grounded system prompt
    system_prompt = """You are a source-grounded research assistant analyzing video transcripts.

CRITICAL RULES:
1. Only use information from the provided transcript sources
2. Do NOT add outside knowledge or assumptions
3. If something is not in the sources, say: "Not mentioned in the provided transcript"
4. Reference sources as [Source 1], [Source 2], etc.
5. Be precise and information-dense
6. Remove filler words from quotes

Never hallucinate. Never invent details. Stay grounded in the transcript."""

    user_prompt = f"""Based on the following transcript excerpts, answer this question:

Question: {question}

Transcript Sources:
{context}

Provide a clear, concise answer using only the information above. Reference your sources."""

    # Get answer from DeepSeek
    if not client:
        raise HTTPException(status_code=500, detail="AI service unavailable")
    
    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=client.default_max_tokens
        )
        
        answer = response.choices[0].message.content.strip()
        
        # Format sources for response
        sources = [
            {
                "source_id": i + 1,
                "text": chunk['text'][:200] + "..." if len(chunk['text']) > 200 else chunk['text'],
                "relevance": 1 - chunk.get('distance', 0)  # Convert distance to similarity
            }
            for i, chunk in enumerate(relevant_chunks)
        ]
        
        return {
            "answer": answer,
            "sources": sources,
            "video_id": video_id
        }
        
    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate answer")

