from fastapi import APIRouter
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

# UPDATED LINE BELOW TO MATCH YOUR DOCKER FILE
client = AsyncIOMotorClient("mongodb://root:rootpassword@mongodb:27017/?authSource=admin")
db = client.metis_db 

class UserAuth(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(user: UserAuth):
    user_dict = user.dict()
    await db.users.insert_one(user_dict)
    return {"message": f"Successfully SAVED {user.email} to the database"}
# ... (Keep your imports and Registration code at the top)

@router.post("/login")
async def login(user: UserAuth):
    # 1. Look for the user in the database by email
    found_user = await db.users.find_one({"email": user.email})
    
    if found_user:
        # 2. Check if the password matches
        # (Note: If you haven't done hashing yet, we just compare the text)
        if found_user["password"] == user.password:
            return {"message": f"Welcome back, {user.email}!"}
        else:
            return {"message": "Wrong password. Try again!"}
            
    return {"message": "User not found. Please register first."}