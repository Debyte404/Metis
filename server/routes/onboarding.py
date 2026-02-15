from fastapi import APIRouter, Depends, BackgroundTasks
from db import get_db, get_current_user
from schemas import NeurologicProfileCreate, ServerConfig
from motor.motor_asyncio import AsyncIOMotorDatabase
from ai_engine.bitnetWrapper import safe_start_process

router = APIRouter()

# visualmode, granularity, gamification

@router.post(
    "/api/onboarding",
    response_model=dict
    )
async def create_profile(
    profile: NeurologicProfileCreate,
    background_tasks: BackgroundTasks,
    x_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
    # db is the database associated with the user
    # client["user_USERID"]
):
    res = await db.neural_profile.find_one(
        {"x_user_id": x_user_id}
    )
    if res:
        system_prompt = res["system_prompt"]
        server_config = ServerConfig(
            system_prompt=system_prompt
        )
        background_tasks.add_task(safe_start_process, server_config, x_user_id)
        return {"id": x_user_id, "status": "already exists", "redirect": "/dashboard"}
    else:
        profile_dict = profile.model_dump()
        comm_style = profile.communication_style
        if comm_style == "direct":
            comm_instr = "Use short, imperative sentences. No 'I think' or 'Maybe'. No emojis."
        elif comm_style == "gentle":
            comm_instr = "Use validating language ('It's okay to feel stuck'). Use calming emojis (🌿, 🍵). Compliment the user for micro-wins"
        elif comm_style == "drill sergeant":
            comm_instr = "Be firm. Capitalize ACTION VERBS."
        else:
            comm_instr = "Be professional and helpful."
        granularity = profile.granularity
        if granularity == "high":
            gran_instr = "You MUST break every task into micro-steps that take <5 minutes."
        else:
            gran_instr = "Break the task into minimum logical steps."
        prompt = f"""
You are 'Metis', an AI Executive Function Assistant. Your goal is to help {profile.get('name', 'the user')} overcome executive dysfunction.

IMPORTANT USER CONFIGURATION:
1. **Communication Style**: {comm_instr}
2. **Granularity**: {gran_instr}

OUTPUT INSTRUCTION:
Decompose the user's task into numbered steps. Always use the USER CONFIGURATION to develop/generate the tasks
Format: {{"1": "step description", "2": "step description"}} in json

INSTRUCTIONS:
* Never judge the user for procrastination.
""".strip()
        profile_dict["x_user_id"] = x_user_id
        profile_dict["system_prompt"] = prompt
        server_config = ServerConfig(
            system_prompt=prompt
        )
        await db.neural_profile.insert_one(profile_dict)
        background_tasks.add_task(safe_start_process, server_config, x_user_id)
        return {"id": x_user_id, "status": "saved", "redirect": "/dashboard"}
