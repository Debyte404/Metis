from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Metis API")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Metis API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    # Binding to 0.0.0.0 makes it accessible to the main OS when running in Docker
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
