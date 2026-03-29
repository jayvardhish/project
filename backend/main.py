import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables at the very beginning
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, videos, quizzes, ocr, math, chat, vdo_ocr
from database import close_db

app = FastAPI(title="Smart Multimodal Learning Platform API")

# Configure CORS
origins = [
    os.getenv("CLIENT_URL", "http://localhost:5173"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://playful-caramel-674bc8.netlify.app",
    "https://smartlearn-frontend.onrender.com",
    "https://smart-learning-frontend.onrender.com",     # Hyphenated version from render.yaml
    "https://smart-learning-platform.onrender.com",     # Common variation
]

# Add production URLs from env if set
production_url = os.getenv("PRODUCTION_CLIENT_URL")
if production_url:
    origins.append(production_url)

frontend_url_env = os.getenv("FRONTEND_URL")
if frontend_url_env and frontend_url_env not in origins:
    origins.append(frontend_url_env)

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
app.include_router(chat.router)
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
