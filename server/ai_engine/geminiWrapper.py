from google import genai
import os
import logging
from fastapi import HTTPException
from schemas import ServerConfig

logger = logging.getLogger(__name__)

class GeminiEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.error("GEMINI_API_KEY not found in environment variables")
        
        self.client = None
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            
    async def generate_content(self, system_prompt: str, user_prompt: str, model_name: str = "gemini-3-flash-preview"):
        if not self.client:
             raise HTTPException(status_code=500, detail="Gemini API Key not configured")

        try:
            # Combine prompts as before
            combined_prompt = f"System Instruction: {system_prompt}\n\nUser Message: {user_prompt}"
            
            # The new SDK might specific async usage or standard usage. 
            # Looking at standard docs: client.models.generate_content(...)
            # For async, we might need to wrap it or check if there is an async client.
            # However, for now, let's assume valid sync call or check if 'aio' subpackage exists.
            # Actually, google-genai usually has async support via `client.aio`.
            
            response = await self.client.aio.models.generate_content(
                model=model_name,
                contents=combined_prompt
            )
            
            if response.text:
                return response.text
            else:
                return "No response generated."
                
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            raise HTTPException(status_code=502, detail=f"Gemini API Error: {str(e)}")

# Global instance
gemini_engine = GeminiEngine()
