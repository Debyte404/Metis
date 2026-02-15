from fastapi import APIRouter, Depends, HTTPException
from db import get_db, get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from schemas import ItemType, Gamification, Granularity, BrainDump, EventType
from typing import Optional
from ai_engine.bitnetWrapper import send_prompt
import re, json

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)

# each "job" would be broken down into smaller "tasks"
# these "tasks" will be stored, retreived and displayed if the user
# chooses high granularity
# job : make a sandwich, task : steps to make sandwich

def extract_json(raw_text: str):
    try:
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            return json.loads(json_str)
        return {"error": "No JSON found in response"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON format"}  

@router.get("/state")
async def get_user_state(
    x_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    neural_profile = db.neural_profile.find_one({"x_user_id": x_user_id})
    # first find if there is any pending "task"
    return_val = {
        "user_preferences": {
            "visual_mode": neural_profile["visualmode"],
            "granularity": neural_profile["granularity"],
            "gamification": neural_profile["gamification"]
        },
    }
    next_step = None
    if neural_profile["granularity"] == Granularity.high:
        task_query = {
            "x_user_id": x_user_id,
        }
        task = await db.tasks.find_one(task_query)
        if task:
            steps_dict = task["steps"]
            if steps_dict: # if not empty
                sorted_keys = sorted([int(k) for k in steps_dict.keys()])
                step_desc = steps_dict.get(sorted_keys[0])
                val = {
                    "id": str(task["_id"]),
                    "step_key": str(sorted_keys[0]),
                    "content": step_desc,
                    "parent_task_id": task["parent_task_id"]  # the id of the parent "job"
                }
                next_step = val
            else:
                next_step = None
        else:
            next_step = None
    return_val["next_task"] = next_step
        
    if neural_profile["granularity"] == Granularity.low \
          or next_step == None:
        # if the user chose low granularity or there are no pending tasks
        job = await db.jobs.find_one(
            {"status": "pending"},
            sort=[
                ("priority", -1),
                ("created_at", 1),
            ]
        )
        val = {
            "id": str(job["_id"]),
            "content": job["description"]
        } if job else None
        return_val["next_job"] = val
    if neural_profile["gamification"] == Gamification.gamified:
        xp = await db.xp_points.find_one({"x_user_id": x_user_id})
        return_val["xp_points"] = xp["total"] if xp else 0
    return return_val

@router.post("/clickevent")
async def completed_item(
    event_type: EventType,
    item_type: ItemType,
    item_id: str,
    step_key: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    x_user_id: str = Depends(get_current_user)
):
    achievements = {}
    neural_profile = await db.neural_profile.find_one({"x_user_id": x_user_id})
    gamified = neural_profile.get("gamification")
    if item_type == ItemType.task:
        # remove the step from the dictionary
        # thanks gemini
        updated_result = await db.tasks.update_one(
            {"_id": ObjectId(item_id)},
            {"$unset": {f"steps.{step_key}": ""}}
        )
        if updated_result.modified_count == 0:
            raise HTTPException(400, "Step not found")
        achievements[10] = "Completed a task"
        # check if the steps dict get empty after this
        updated_doc = await db.tasks.find_one({"_id": ObjectId(item_id)})
        if updated_doc and not updated_doc.get("steps"):
            parent_task_id = updated_doc.get("parent_task_id") # get id of the job
            if parent_task_id:
                await db.jobs.update_one(
                    {"_id": ObjectId(parent_task_id)},
                    {"$set": {"status": "completed"}}
                )
            await db.tasks.delete_one({"_id": ObjectId(item_id)})
            achievements[50] = "Completed a job"
            #TODO: index jobs
    elif item_type == ItemType.job:
        result = await db.jobs.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": {"status": "completed"}}
        )
        if result.modified_count == 0:
            raise HTTPException(400, "Job not found")
        achievements[50] = "Completed a job"
    returnval = {"status": "success"}
    if gamified == Gamification.gamified and achievements and event_type == EventType.completed:
        total_points = sum(achievements.keys())
        await db.xp_points.update_one(
            {"x_user_id": x_user_id},
            {"$inc": {"total": total_points}},
            upsert=True
        )
        returnval["achievements"] = achievements
    return returnval

@router.post("/decomposejob")
async def decompose_job(
    item_id: str,
    x_user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    job = await db.jobs.find_one(
        {"_id": ObjectId(item_id)}
    )
    desc = job["description"]
    prompt = f"""Decompose the following job: {desc} and provide response in the format {{"1": "step description", "2": "step description"}}"""
    try:
        response = await send_prompt(x_user_id, prompt)
        steps = extract_json(response)
        task = {
            "x_user_id": x_user_id,
            "parent_task_id": item_id,
            "steps": steps
        }
        # add to the tasks collection
        await db.tasks.update_one(
            {"x_user_id": x_user_id},
            task,
            upsert=True
        )
        return {"success": "job added"}
    except Exception as e:
        return {"failed": f"ERROR: {e}"}

@router.post("/braindump")
async def braindump(
    payload: BrainDump,
    db: AsyncIOMotorDatabase = Depends(get_db),
    x_user_id: str = Depends(get_current_user)
):
    # payload is a raw text written by the user like
    # "buy some groceries, meet up with boys, watch vsauce"
    raw_string = payload.content
    '''
    Feed raw_string to AI to compose "jobs"
    '''
    jobs = [] # list of job titles
    for index, job in enumerate(jobs):
        new_job = {
            "description": job,
            "priority": index,
            "created_at": "00:36",
            "status": "pending"
        }
        await db.jobs.insert_one(new_job)
