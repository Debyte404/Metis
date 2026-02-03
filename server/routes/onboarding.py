from fastapi import APIRouter, Depends
from ..db import get_db
from ..schemas import NeurologicProfileCreate, NeurologicProfileResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.post(
    "/onboarding/{user_id}",
    response_model=NeurologicProfileResponse
    )
async def create_profile(
    user_id: str,
    profile: NeurologicProfileCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # converting the model to dict
    profile_dict = profile.model_dump()
    profile_dict["user_id"] = user_id

    await db.neura_profiles.replace_one(
        {
            "user_id": user_id
        },
        profile_dict,
        upsert=True
    )
    return {"id": user_id, "status": "saved"}