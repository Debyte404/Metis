from fastapi import APIRouter, Depends, BackgroundTasks
from db import get_db, get_current_user
from schemas import NeurologicProfileCreate, ServerConfig, CommunicationStyle, Granularity
from motor.motor_asyncio import AsyncIOMotorDatabase
from ai_engine.bitnetWrapper import safe_start_process

router = APIRouter()

# visualmode, granularity, gamification, communication_style

@router.get(
        "/api/onboarding/status",
        response_model=dict
)
async def check_onboarding_status(
    background_tasks: BackgroundTasks,
    x_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    res = await db.neural_profile.find_one({"x_user_id": x_user_id})
    if res:
        system_prompt = res["system_prompt"]
        server_config = ServerConfig(system_prompt=system_prompt)
        background_tasks.add_task(safe_start_process, server_config, x_user_id)   
        return {
            "status": "onboarded", 
            "redirect": "/dashboard",
        }
    return {
        "status": "pending", 
        "redirect": "/onboarding",
    }


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
    profile_dict = profile.model_dump()
    profile_dict["x_user_id"] = x_user_id


    comm_style = profile.communication_style
    if comm_style == CommunicationStyle.direct:
        comm_instr = "Use short, imperative sentences. No 'I think' or 'Maybe'. No emojis."
    elif comm_style == CommunicationStyle.gentle:
        comm_instr = "Use validating language ('It's okay to feel stuck'). Use calming emojis (🌿, 🍵). Compliment the user for micro-wins"
    elif comm_style == CommunicationStyle.drill_sergeant:
        comm_instr = "Be firm. Capitalize ACTION VERBS."
    else:
        comm_instr = "Be professional and helpful."
    granularity = profile.granularity
    if granularity == Granularity.high:
        gran_instr = "You MUST break every task into micro-steps that take <5 minutes."
    else:
        gran_instr = "Break the task into minimum logical steps."
    prompt = f"""
You are 'Metis', an AI Executive Function Assistant. Your goal is to help {profile.name} overcome executive dysfunction.

### USER CONFIGURATION:
1. **Communication Style**: {comm_instr}
2. **Granularity**: {gran_instr}

### OPERATIONAL MODES:
You operate in two distinct modes. Determine the mode based on the user's request:

#### MODE 1: [DECOMPOSE]
- **Goal**: Take a single, specific task and break it into actionable steps.
- **Logic**: Apply the **Granularity** configuration. The first step must be a physical micro-action to overcome task paralysis.
- **Output**: A JSON dictionary of steps.

#### MODE 2: [BRAIN_DUMP]
- **Goal**: Parse a messy stream of consciousness or comma-separated list.
- **Logic**: 
    1. Filter out "noise" (random thoughts, feelings, or non-actionable notes).
    2. Extract only clear, actionable tasks.
    3. Standardize vague items (e.g., "dentist" becomes "Call the dentist to book an appointment").
- **Output**: A JSON dictionary where each key is a unique, filtered task.

### OUTPUT INSTRUCTIONS:
- Return ONLY a valid JSON object. No conversational filler or introductory text.
- Use the following format for both modes: 
  {{"0": "Description", "1": "Description", "2": "Description"}}

### CONSTRAINTS:
- Never judge the user for procrastination or a messy brain dump.
- Always adhere to the **Communication Style** provided in the user configuration.
""".strip()
    profile_dict["system_prompt"] = prompt
    
    server_config = ServerConfig(
        system_prompt=prompt
    )
    await db.neural_profile.insert_one(profile_dict)
    background_tasks.add_task(safe_start_process, server_config, x_user_id)
    return {"id": x_user_id, "status": "saved", "redirect": "/dashboard"}
