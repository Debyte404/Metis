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

class NeurologicProfile(BaseModel):
    visualmode: VisualMode
    granularity: Granularity
    gamification: Gamification

class NeurologicProfileResponse(NeurologicProfile):
    x_user_id: int

class NeurologicProfileCreate(NeurologicProfile):
    pass

