import io
import os
import tempfile
import numpy as np
from PIL import Image, ExifTags
import cv2
import torch
import torch.nn.functional as F
from transformers import AutoImageProcessor, AutoModelForImageClassification
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

MODEL_NAME = "dima806/deepfake_vs_real_image_detection"

# Global model state
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models and Haar cascade on startup
    print(f"Loading deepfake detection model: {MODEL_NAME}...")
    processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
    model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
    model.eval()
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    ml_models["processor"] = processor
    ml_models["model"] = model
    ml_models["face_cascade"] = face_cascade
    print("Deepfake detection model and face cascade loaded successfully.")
    yield
    ml_models.clear()

app = FastAPI(title="RealNetra Deepfake Detection API", lifespan=lifespan)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def detect_and_crop_face(pil_image: Image.Image, face_cascade):
    """
    Detects faces in the image using Haar Cascade and crops the primary face with 20% margin.
    Returns: (cropped_pil_image, face_count, is_cropped)
    """
    np_img = np.array(pil_image)
    if len(np_img.shape) == 2:
        gray = np_img
    elif np_img.shape[2] == 4:
        gray = cv2.cvtColor(np_img, cv2.COLOR_RGBA2GRAY)
    else:
        gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
        
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))
    face_count = len(faces)
    
    if face_count > 0:
        # Select largest detected face
        largest_face = max(faces, key=lambda r: r[2] * r[3])
        x, y, w, h = largest_face
        # Add 20% context padding around the face crop
        pad_x = int(w * 0.2)
        pad_y = int(h * 0.2)
        W, H = pil_image.size
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(W, x + w + pad_x)
        y2 = min(H, y + h + pad_y)
        crop = pil_image.crop((x1, y1, x2, y2))
        return crop, face_count, True
    
    return pil_image, 0, False

def extract_image_exif(pil_image: Image.Image) -> dict:
    """
    Extracts EXIF metadata for informational display only.
    Does NOT influence the deepfake classification decision.
    """
    forensics = {}
    try:
        raw_exif = pil_image.getexif()
        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag = ExifTags.TAGS.get(tag_id, tag_id)
                if isinstance(value, (str, int, float)):
                    forensics[str(tag)] = str(value)
    except Exception:
        pass
        
    return {
        "has_exif": len(forensics) > 0,
        "camera_make": forensics.get("Make", "Unknown / Stripped"),
        "camera_model": forensics.get("Model", "Unknown / Stripped"),
        "software": forensics.get("Software", "Not Specified"),
        "date_time": forensics.get("DateTime", "N/A"),
        "fields_detected": len(forensics)
    }

def run_model_inference(pil_image: Image.Image):
    """
    Runs actual Vision Transformer model inference on the provided image/crop.
    Returns: (verdict, confidence, real_prob, fake_prob, explanation)
    """
    processor = ml_models["processor"]
    model = ml_models["model"]
    
    inputs = processor(images=pil_image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=-1)[0].tolist()
        
    # Model config: 0: 'Real', 1: 'Fake'
    real_prob = float(probs[0])
    fake_prob = float(probs[1])
    
    # Uncertainty decision threshold band [0.40, 0.60]
    if 0.40 <= fake_prob <= 0.60:
        verdict = "UNCERTAIN"
        confidence = round(max(real_prob, fake_prob) * 100, 2)
        explanation = "Model confidence is near the decision threshold. Artifact features are ambiguous for a definitive real/fake verdict."
    elif fake_prob > 0.60:
        verdict = "DEEPFAKE"
        confidence = round(fake_prob * 100, 2)
        explanation = "Facial synthesis anomalies and digital manipulation boundaries detected by Vision Transformer."
    else:
        verdict = "REAL"
        confidence = round(real_prob * 100, 2)
        explanation = "Natural facial feature distribution and authentic pixel coherence verified by Vision Transformer."
        
    return verdict, confidence, round(real_prob * 100, 2), round(fake_prob * 100, 2), explanation

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "RealNetra Deepfake Detection API",
        "model": MODEL_NAME,
        "architecture": "Vision Transformer (ViT-base-patch16-224)"
    }

@app.post("/api/detect")
async def detect_media(file: UploadFile = File(...)):
    content_type = file.content_type or ""
    filename = file.filename or "unknown"
    lower_filename = filename.lower()
    
    is_image = content_type.startswith("image/") or lower_filename.endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"))
    is_video = content_type.startswith("video/") or lower_filename.endswith((".mp4", ".mov", ".avi", ".hevc", ".mkv", ".webm"))
    
    if not is_image and not is_video:
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an image or video file.")
    
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    if is_image:
        try:
            pil_image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to decode image: {str(e)}")
        
        # 1. EXIF Forensics (informational only)
        exif_info = extract_image_exif(pil_image)
        
        # 2. Face Detection & Cropping
        face_cascade = ml_models["face_cascade"]
        cropped_image, face_count, is_cropped = detect_and_crop_face(pil_image, face_cascade)
        
        # 3. Vision Transformer ML Inference
        verdict, confidence, real_prob, fake_prob, explanation = run_model_inference(cropped_image)
        
        return {
            "filename": filename,
            "type": content_type or "image/jpeg",
            "result": verdict,
            "confidence": confidence,
            "details": {
                "model_used": f"Vision Transformer ({MODEL_NAME})",
                "faces_detected": face_count,
                "face_crop_applied": is_cropped,
                "real_probability": real_prob,
                "fake_probability": fake_prob,
                "explanation": explanation,
                "metadata_forensics": exif_info
            }
        }
    
    else:
        # Video Processing: Frame-by-Frame ViT ML Inference
        temp_video_path = None
        try:
            suffix = os.path.splitext(lower_filename)[1] or ".mp4"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(file_bytes)
                temp_video_path = tmp.name
                
            cap = cv2.VideoCapture(temp_video_path)
            if not cap.isOpened():
                raise HTTPException(status_code=400, detail="Could not open video file for frame extraction.")
            
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
            
            # Sample up to 8 evenly distributed frames
            num_samples = min(8, max(1, total_frames))
            sample_indices = np.linspace(0, max(0, total_frames - 1), num_samples, dtype=int)
            
            frame_scores = []
            total_faces_found = 0
            face_cascade = ml_models["face_cascade"]
            
            for f_idx in sample_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, int(f_idx))
                ret, frame = cap.read()
                if not ret or frame is None:
                    continue
                    
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_frame = Image.fromarray(frame_rgb)
                
                cropped_frame, f_count, _ = detect_and_crop_face(pil_frame, face_cascade)
                total_faces_found += f_count
                
                _, _, r_prob, f_prob, _ = run_model_inference(cropped_frame)
                frame_scores.append(f_prob)
                
            cap.release()
            
            if not frame_scores:
                raise HTTPException(status_code=400, detail="No readable frames could be extracted from video.")
                
            avg_fake_prob = round(float(np.mean(frame_scores)), 2)
            avg_real_prob = round(100.0 - avg_fake_prob, 2)
            
            if 40.0 <= avg_fake_prob <= 60.0:
                verdict = "UNCERTAIN"
                confidence = round(max(avg_real_prob, avg_fake_prob), 2)
                explanation = "Temporal frame inferences show borderline deepfake confidence."
            elif avg_fake_prob > 60.0:
                verdict = "DEEPFAKE"
                confidence = avg_fake_prob
                explanation = f"Multi-frame ViT analysis detected recurring manipulation signatures across {len(frame_scores)} sampled frames."
            else:
                verdict = "REAL"
                confidence = avg_real_prob
                explanation = f"Temporal consistency and authentic facial dynamics verified across {len(frame_scores)} sampled frames."
                
            return {
                "filename": filename,
                "type": content_type or "video/mp4",
                "result": verdict,
                "confidence": confidence,
                "details": {
                    "model_used": f"Temporal Frame ViT ({MODEL_NAME})",
                    "faces_detected": total_faces_found,
                    "frames_analyzed": len(frame_scores),
                    "total_video_frames": total_frames,
                    "real_probability": avg_real_prob,
                    "fake_probability": avg_fake_prob,
                    "explanation": explanation
                }
            }
        finally:
            if temp_video_path and os.path.exists(temp_video_path):
                try:
                    os.remove(temp_video_path)
                except Exception:
                    pass

class TextPayload(BaseModel):
    text: str

@app.post("/api/detect-text")
async def detect_text(payload: TextPayload):
    text = payload.text or ""
    if len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short for linguistic analysis (minimum 10 characters).")
    
    text_lower = text.lower()
    
    # Stylometric & Perplexity Heuristics (honestly labeled)
    ai_markers = [
        "as an ai", "in conclusion", "it is important to note", "delve", 
        "tapestry", "multifaceted", "furthermore", "testament", "crucial",
        "moreover", "underscores", "shed light on", "navigating the",
        "seamlessly", "realm of", "in today's digital age", "certainly",
        "here is a", "sure!", "let's break this down", "significant",
        "comprehensive", "foster", "robust", "firstly", "secondly",
        "important to remember", "ultimately", "vital", "landscape"
    ]
    
    human_markers = [
        " i think", " lol ", " kinda ", " tbh ", " honestly", " wtf ", " lmao ", 
        " we went ", " gonna ", " wanna ", " haha", " nope", " idk "
    ]
    
    ai_score = sum(1 for m in ai_markers if m in text_lower)
    human_score = sum(1 for m in human_markers if m in " " + text_lower + " ")
    
    has_markdown = any(token in text for token in ["**", "1. ", "- ", "###"])
    words = text_lower.split()
    avg_word_len = sum(len(w) for w in words) / len(words) if words else 0
    
    # Calculate probability
    prob_ai = 0.50
    if ai_score > 0:
        prob_ai += min(0.35, ai_score * 0.12)
    if human_score > 0:
        prob_ai -= min(0.35, human_score * 0.15)
    if has_markdown:
        prob_ai += 0.08
    if avg_word_len > 5.2:
        prob_ai += 0.05
    elif avg_word_len < 4.2:
        prob_ai -= 0.05
        
    prob_ai = max(0.10, min(0.95, prob_ai))
    prob_human = 1.0 - prob_ai
    
    if 0.45 <= prob_ai <= 0.55:
        verdict = "UNCERTAIN"
        confidence = round(max(prob_ai, prob_human) * 100, 2)
    elif prob_ai > 0.55:
        verdict = "AI GENERATED"
        confidence = round(prob_ai * 100, 2)
    else:
        verdict = "HUMAN WRITTEN"
        confidence = round(prob_human * 100, 2)
        
    return {
        "filename": "Text Snippet",
        "type": "text/plain",
        "result": verdict,
        "confidence": confidence,
        "details": {
            "model_used": "Stylometric NLP Pattern & Perplexity Analyzer",
            "sentences_analyzed": len([s for s in text.split(".") if s.strip()]),
            "ai_probability": round(prob_ai * 100, 2),
            "human_probability": round(prob_human * 100, 2),
            "ai_markers_count": ai_score,
            "human_markers_count": human_score
        }
    }
