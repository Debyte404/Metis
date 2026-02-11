from fastapi import APIRouter, Depends
from db import get_db
from schemas import NeurologicProfileCreate
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

# visualmode, granularity, gamification

@router.post(
    "/api/onboarding",
    response_model=dict
    )
async def create_profile(
    
    userid: str,
    profile: NeurologicProfileCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
    # db is the database associated with the user
    # client["user_USERID"]
):
    # converting the model to dict
    profile_dict = profile.model_dump()
    profile_dict["user_id"] = userid
    # neura_profile collection containing the user preferences
    await db.neural_profile.replace_one(
        {
            "user_id": userid
        },
        profile_dict,
        upsert=True
    )
    return {"id": userid, "status": "saved"}