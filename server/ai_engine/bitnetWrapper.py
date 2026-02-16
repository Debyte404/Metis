from groq import Groq
from schemas import ServerConfig
import logging, time
from fastapi import HTTPException
import json
# BitNet wrapper to run multiple llama.cpp servers concurrently
# and handle requests
client = Groq("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")
logger = logging.getLogger(__name__)

ACTIVE_SESSIONS = {}
# user_id -> {"port": int, "pid": int, "process": process, "last_active": float}
async def safe_start_process(server_config: ServerConfig, x_user_id: str):
    
    ACTIVE_SESSIONS[x_user_id] = {
            "port": 0,
            "pid": "hehe",
            "process": "process",
            "last_active": time.time(),
            "system_prompt": server_config.system_prompt
        }

async def send_prompt(x_user_id: str, user_prompt: str):
    session = ACTIVE_SESSIONS.get(x_user_id)
    if session:
        system_prompt = ACTIVE_SESSIONS["system_prompt"]
        session["last_active"] = time.time()
        try:
            chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.7
            )
            raw_json = chat_completion.choices[0].message.content
            response_dict = json.loads(raw_json)
            return response_dict
        except Exception as e:
            raise HTTPException(502, f"ERROR : {e}")
