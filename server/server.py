from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings
import uvicorn
import os

class Settings(BaseSettings):
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://root:rootpassword@localhost:27017/")
    secret_key: str = "your-secret-key"

settings = Settings()
app = FastAPI(title="Metis API")

# Initialize MongoDB Client
client = AsyncIOMotorClient(settings.mongodb_url)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get the current user's isolated database
async def get_db(x_user_id: str = Header(...)):
    """
    Isolates data by providing a database named after the user_id.
    In a real app, this user_id should be extracted from a verified JWT.
    """
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header is required for isolation")
    
    # Each user gets their own database
    db_name = f"user_{x_user_id}"
    return client[db_name]

@app.get("/")
async def root():
    return {"message": "Welcome to Metis API with MongoDB Isolation"}

@app.get("/health")
async def health():
    try:
        # Check if MongoDB is reachable
        await client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.post("/data")
async def save_data(payload: dict, db = Depends(get_db)):
    """Example of saving data into a user-isolated database."""
    result = await db.items.insert_one(payload)
    return {"id": str(result.inserted_id), "status": "saved"}

@app.get("/data")
async def get_data(db = Depends(get_db)):
    """Example of retrieving data from a user-isolated database."""
    cursor = db.items.find({})
    items = await cursor.to_list(length=100)
    # Convert ObjectId to string for JSON serialization
    for item in items:
        item["_id"] = str(item["_id"])
    return {"items": items}

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
