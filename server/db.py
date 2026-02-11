from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import HTTPException, Header
from pydantic_settings import BaseSettings
import os
import logging

class Settings(BaseSettings):
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://root:rootpassword@localhost:27017/")
    secret_key: str = "your-secret-key"

logging.info("Initializing MongoDB Client")
settings = Settings()
DB_NAME = "metis_db" # for user authentication, any non-user related data
client = AsyncIOMotorClient(settings.mongodb_url)

async def user_is_exists(x_user_id: str) -> bool:
    db = client[DB_NAME]
    user = await db.users.find_one({"_id": x_user_id}) # check from "users" collection
    return True if user else False

async def get_db(x_user_id: str = Header(...)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header is required for isolation")
    '''
    exists = await user_is_exists(x_user_id)
    if not exists:
        raise HTTPException(status_code=403, detail="User is not authorized")
    '''
    db_name = f"user_{x_user_id}"
    return client[db_name] # return the database associated with that user 


