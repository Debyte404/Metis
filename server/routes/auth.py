from fastapi import APIRouter, HTTPException
import datetime
from datetime import datetime, timedelta
from jose import jwt
from uuid import uuid4
from schemas import UserSignup
from passlib.context import CryptContext
from db import client, EXPIRY, SECRET_KEY, ALGORITHM

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

db = client["metis_db"]
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_access_token(data: dict):
    data["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRY)
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/signup")
async def register(user: UserSignup):
    res = await db.users.find_one(
        {"email": user.email}
    )
    if res:
        raise HTTPException(400, "email already exists")
    x_user_id = f"user_{uuid4().hex[:8]}"
    user_dict = user.model_dump()
    '''
    user_dict = {
        "x_user_id": str,
        "email": str,
        "password": str
    }
    '''
    user_dict["x_user_id"] = x_user_id
    user_dict["password"] = bcrypt_context.hash(user.password)
    await db.users.insert_one(user_dict)
    return {"status":"success", "redirect": "/login"}

@router.post("/login", response_model=dict)
async def login(user: UserSignup):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(401, "invalid credentials")
    if not bcrypt_context.verify(user.password, db_user["password"]):
        raise HTTPException(401, "invalid credentials")
    access_token = create_access_token(
        data={"username": user.email, "x_user_id": db_user["x_user_id"]}
    )
    return {"access_token": access_token, "token_type": "bearer", "redirect": "/onboarding"}
# redirect to onboarding paget
    
    