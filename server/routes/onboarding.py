from fastapi import APIRouter, Depends
from db import get_db, get_current_user
from schemas import NeurologicProfileCreate
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

# visualmode, granularity, gamification

@router.post(
    "/api/onboarding",
    response_model=dict
    )
async def create_profile(
    profile: NeurologicProfileCreate,
    x_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
    # db is the database associated with the user
    # client["user_USERID"]
):
    res = await db.neural_profile.find_one(
        {"x_user_id": x_user_id}
    )
    if res:
        return {"redirect": "/dashboard"}
    profile_dict = profile.model_dump()
    profile_dict["x_user_id"] = x_user_id
    await db.neural_profile.insert_one(profile_dict)
    return {"id": x_user_id, "status": "saved", "redirect": "/dashboard"}