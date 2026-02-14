from enum import Enum
from pydantic import BaseModel

class VisualMode(str, Enum):
    dyslexic = "dyslexic"
    standard = "standard"

class Granularity(str, Enum):
    low = "low"
    high = "high"

class Gamification(str, Enum):
    standard = "standard"
    gamified = "gamified"

class ItemType(str, Enum):
    task = "task"
    job = "job"

class NeurologicProfile(BaseModel):
    visualmode: VisualMode
    granularity: Granularity
    gamification: Gamification

class NeurologicProfileResponse(NeurologicProfile):
    x_user_id: str

class NeurologicProfileCreate(NeurologicProfile):
    pass

class BrainDump(BaseModel):
    content: str

class UserSignup(BaseModel):
    email: str
    password: str

