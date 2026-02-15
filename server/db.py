from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import HTTPException, Depends
from pydantic_settings import BaseSettings
import os
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import logging
from uuid import uuid4
import hashlib

logger = logging.getLogger(__name__)
SECRET_KEY = hashlib.sha256(uuid4().hex.encode()).hexdigest()
ALGORITHM = "HS256"
EXPIRY = 60 * 24

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/login")

class Settings(BaseSettings):
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://root:rootpassword@localhost:27017/")
    secret_key: str = "your-secret-key"

logger.info("Initializing MongoDB Client")
settings = Settings()
DB_NAME = "metis_db" # for user authentication, any non-user related data
client = AsyncIOMotorClient(settings.mongodb_url)

async def get_current_user(token: str = Depends(oauth2_bearer)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        x_user_id = payload["x_user_id"]
        return x_user_id
    except (KeyError, JWTError):
        raise HTTPException(
            status_code=403,
            detail="could not validate user"
        )

async def get_db(x_user_id: str = Depends(get_current_user)):
    db_name = x_user_id
    return client[db_name] 


