from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import time
import random
import asyncio
from PIL import Image
import io

app = FastAPI(title="Deepfake Detection API")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Deepfake Detection API Simulation is running."}

@app.post("/api/detect")
async def detect_media(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/") and not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image or video.")
    
    # Simulate processing time for realistic UI (wait 3 seconds total but chunked across steps in frontend ideally)
    # The frontend will maintain the stepper. We will just return the simulated result after a delay.
    await asyncio.sleep(2)
    # Smart Heuristic Simulation for Images
    is_fake = True
    confidence = round(random.uniform(85.0, 95.0), 2)
    model_used = "Heuristic Metadata + Noise Analysis (Simulated CNN)"
    
    if file.content_type.startswith("image/"):
        try:
            # Read image to check for metadata which AI generators often omit
            image_data = await file.read()
            img = Image.open(io.BytesIO(image_data))
            
            # Check EXIF data (Real camera photos have rich EXIF; AI generated usually have none)
            exif = img.getexif()
            if exif and len(exif) > 2:
                is_fake = False # Likely real photo from a camera device
                confidence = round(random.uniform(90.0, 99.0), 2)
            else:
                is_fake = True # Likely AI generated / stripped
                confidence = round(random.uniform(88.0, 97.0), 2)
                
            # Reset file pointer for any downstream usages
            await file.seek(0)
        except Exception:
            pass # fallback to default if image parsing fails
    else:
        model_used = "Temporal Frame Analysis (Simulated LSTM)"
        # Simple heuristic for video: If the filename contains 'fake' or 'ai' we flag it.
        # Otherwise, we randomly assign but leaning towards REAL for regular files.
        lower_name = file.filename.lower()
        if 'fake' in lower_name or 'ai' in lower_name or 'synth' in lower_name:
            is_fake = True
            confidence = round(random.uniform(92.0, 98.5), 2)
        else:
            is_fake = False
            confidence = round(random.uniform(85.0, 97.0), 2)
    
    return {
        "filename": file.filename,
        "type": file.content_type,
        "result": "DEEPFAKE" if is_fake else "REAL",
        "confidence": confidence,
        "details": {
            "model_used": model_used,
            "faces_detected": random.randint(1, 3),
            "artifacts_found": random.randint(5, 20) if is_fake else 0
        }
    }

class TextPayload(BaseModel):
    text: str

@app.post("/api/detect-text")
async def detect_text(payload: TextPayload):
    if not payload.text or len(payload.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short for analysis.")
    
    await asyncio.sleep(2)
    
    text_lower = payload.text.lower()
    
    # Expanded AI buzzwords/phrases commonly used by ChatGPT
    ai_flags = [
        "as an ai", "in conclusion", "it is important to note", "delve", 
        "tapestry", "multifaceted", "furthermore", "testament", "crucial",
        "moreover", "underscores", "shed light on", "navigating the",
        "seamlessly", "realm of", "in today's digital age", "certainly",
        "here is a", "sure!", "let's break this down", "significant",
        "comprehensive", "foster", "robust", "firstly", "secondly",
        "important to remember", "ultimately", "vital", "landscape",
        "i can help", "however", "additionally", "notably"
    ]
    
    # Casual human markers (strict list)
    human_flags = [
        " i think", " lol ", " kinda ", " tbh ", " honestly", " wtf ", " lmao ", 
        " we went ", " gonna ", " wanna ", " haha", " nope", " idk "
    ]
    
    ai_score = sum(1 for flag in ai_flags if flag in text_lower)
    human_score = sum(1 for flag in human_flags if flag in " " + text_lower + " ")
    
    # AI models frequently use markdown bullet points or numbered lists
    if "**" in payload.text or "1. " in payload.text or "- " in payload.text or "###" in payload.text:
        ai_score += 3
        
    words = text_lower.split()
    avg_word_len = sum(len(w) for w in words) / len(words) if words else 0
    
    # AI tends to use longer, more complex words on average
    if avg_word_len > 5.0:
        ai_score += 1
    
    # Humans often use short sentences; AI usually writes longer, complex ones
    if len(words) > 25:
        ai_score += 1

    # Decision logic - Highly biased towards flagging AI
    if ai_score > 0 and human_score == 0:
        is_fake = True
        confidence = round(random.uniform(92.0, 99.5), 2)
    elif human_score > ai_score * 2:
        is_fake = False
        confidence = round(random.uniform(85.0, 98.0), 2)
    else:
        # Default to AI for almost everything that is perfectly punctuated / average length
        if len(words) >= 15:
            is_fake = True
            confidence = round(random.uniform(80.0, 95.0), 2)
        else:
            is_fake = False
            confidence = round(random.uniform(60.0, 80.0), 2)
    
    return {
        "filename": "Text Snippet",
        "type": "text/plain",
        "result": "AI GENERATED" if is_fake else "HUMAN WRITTEN",
        "confidence": confidence,
        "details": {
            "model_used": "Heuristic NLP Pattern Matching (Simulated RoBERTa)",
            "sentences_analyzed": len(payload.text.split(".")),
            "artifacts_found": (ai_score * random.randint(2, 5)) if is_fake else 0
        }
    }
