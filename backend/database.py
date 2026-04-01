import certifi
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")

if not MONGODB_URI:
        print("Warning: MONGODB_URI not found. Trying local default.")
        MONGODB_URI = "mongodb://localhost:27017"

DATABASE_NAME = os.getenv("DATABASE_NAME", "smart_learning_platform")

import sys

# Always use certifi for SSL handshake to support Render (Linux)
client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())

db = client[DATABASE_NAME]
