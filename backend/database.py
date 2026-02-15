from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")

if not MONGODB_URI:
    print("Warning: MONGODB_URI not found. Trying local default.")
    MONGODB_URI = "mongodb://localhost:27017"

DATABASE_NAME = os.getenv("DATABASE_NAME", "smart_learning_platform")

try:
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    print(f"Connected to MongoDB at {MONGODB_URI.split('@')[-1] if '@' in MONGODB_URI else 'localhost'}")
except Exception as e:
    print(f"Database Connection Error: {e}")
    client = None
    db = None

async def get_database():
    return db

async def close_db():
    if client:
        client.close()
