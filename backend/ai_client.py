import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

# Ensure environment is loaded from the correct path
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

def get_ai_client():
    """
    Returns an initialized OpenAI client for DeepSeek/OpenRouter.
    Ensures environment variables are loaded before initialization.
    """
    api_key = os.getenv("DEEPSEEK_API_KEY")
    
    if not api_key or not api_key.strip():
        print("Warning: DEEPSEEK_API_KEY is missing or empty in .env")
        return None
        
    api_key = api_key.strip()
    # Default to OpenRouter if the key starts with sk-or-
    default_url = "https://openrouter.ai/api/v1" if api_key.startswith("sk-or-") else "https://api.deepseek.com/v1"
    base_url = os.getenv("DEEPSEEK_API_URL", default_url)
    
    print(f"Initializing AI Client with base_url: {base_url}")
    try:
        client = OpenAI(api_key=api_key, base_url=base_url)
        # Attach a default max_tokens to the client instance for convenience
        client.default_max_tokens = 2000
        return client
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        return None

# Eager initialization
client = get_ai_client()
