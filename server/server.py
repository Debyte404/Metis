from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .db import client

app = FastAPI(title="Metis API")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Metis API with MongoDB Isolation"}

@app.get("/health")
async def health():
    try:
        # Check if MongoDB is reachable
        await client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
