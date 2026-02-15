import asyncio
from database import get_database
from auth_utils import get_password_hash
from datetime import datetime

async def main():
    try:
        db = await get_database()
        user = await db.users.find_one({"email": "test@example.com"})
        if not user:
            new_user = {
                "username": "testuser",
                "email": "test@example.com",
                "password_hash": get_password_hash("password123"),
                "created_at": datetime.utcnow()
            }
            await db.users.insert_one(new_user)
            print("TEST USER CREATED: test@example.com / password123")
        else:
            print("TEST USER ALREADY EXISTS")
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
