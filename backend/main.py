import uvicorn
import os
from dotenv import load_dotenv
# Load env before ANY other imports
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from routers import auth, videos, quizzes, ocr, math, essays, chat, plagiarism, learning_path, vdo_ocr
from database import close_db

# Load environment variables
load_dotenv()

app = FastAPI(title="Smart Multimodal Learning Platform API")

# Configure CORS
origins = [
    os.getenv("CLIENT_URL", "http://localhost:5173"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Add production frontend URL if set
production_url = os.getenv("PRODUCTION_CLIENT_URL")
if production_url:
    origins.append(production_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    origin = request.headers.get("origin")
    print(f"DEBUG: Incoming {request.method} request to {request.url.path} from origin: {origin}")
    response = await call_next(request)
    print(f"DEBUG: Response status: {response.status_code}")
    return response

# Register routers
app.include_router(auth.router)
app.include_router(videos.router)
app.include_router(quizzes.router)
app.include_router(ocr.router)
app.include_router(math.router)
app.include_router(essays.router)
app.include_router(chat.router)
app.include_router(plagiarism.router)
app.include_router(learning_path.router)
app.include_router(vdo_ocr.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Smart Multimodal Learning Platform API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
