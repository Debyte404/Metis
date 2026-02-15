from enum import Enum
from pydantic import BaseModel, Field
import psutil
import pathlib, os

MODEL_PATH = os.path.join(
    pathlib.Path(__file__).resolve().parent, 
    "models",
    "BitNet-b1.58-2B-4T",
    "ggml-model-i2_s.gguf")


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

class CommunicationStyle(str, Enum):
    direct = "direct"
    gentle = "gentle"
    drill_sergeant = "drill_sergeant"

class NeurologicProfile(BaseModel):
    visualmode: VisualMode
    granularity: Granularity
    gamification: Gamification
    communication_style: CommunicationStyle

class NeurologicProfileResponse(NeurologicProfile):
    x_user_id: str

class NeurologicProfileCreate(NeurologicProfile):
    pass

class BrainDump(BaseModel):
    content: str

class UserSignup(BaseModel):
    email: str
    password: str

class ServerConfig(BaseModel):
    threads: int = Field(
        default = lambda: psutil.cpu_count(logical = False) or 2,
        gt = 0,
        description = "The number of threads. Optimum is the number of physical cores"
        )
    model: str = Field(default = MODEL_PATH, description = "The path to the 1.58bit model")
    ctx_size: int = Field(
        default=2048,
        gt = 0,
        description = "Context size for the server instance"
    )
    tokens_predict: int = Field(
        default = 2048,
        gt = 0,
        description = "Number of tokens to predict"
    )
    system_prompt: str = Field()
    temperature: float = Field(
        default = 0.8,
        gt = 0.0,
        le = 2.0,
        description = "Sampling temperature for the server instance"
    )

class ResponseModel(BaseModel):
    message: str
