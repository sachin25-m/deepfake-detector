# RealNetra Deepfake Detector Schema & Architecture

This document outlines the API endpoints, data models, and storage structure used in the RealNetra Deepfake Detection application.

## 1. Backend API Schema (FastAPI)

The backend exposes ML endpoints running locally on `http://127.0.0.1:8000`.

### `GET /` (Health & Model Status)
*   **Request Body**: None
*   **Response (JSON)**: 
    ```json
    {
      "status": "online",
      "service": "RealNetra Deepfake Detection API",
      "model": "dima806/deepfake_vs_real_image_detection",
      "architecture": "Vision Transformer (ViT-base-patch16-224)"
    }
    ```

### `POST /api/detect` (Media Scanner)
*   **Request Type**: `multipart/form-data`
*   **Request Body**: `file` (Image or Video binary file)
*   **Success Response (JSON)**:
    ```json
    {
      "filename": "portrait.jpg",
      "type": "image/jpeg",
      "result": "REAL" | "DEEPFAKE" | "UNCERTAIN",
      "confidence": 82.95,
      "details": {
        "model_used": "Vision Transformer (dima806/deepfake_vs_real_image_detection)",
        "faces_detected": 1,
        "face_crop_applied": true,
        "real_probability": 82.95,
        "fake_probability": 17.05,
        "explanation": "Natural facial feature distribution and authentic pixel coherence verified by Vision Transformer.",
        "metadata_forensics": {
          "has_exif": false,
          "camera_make": "Unknown / Stripped",
          "camera_model": "Unknown / Stripped",
          "software": "Not Specified",
          "date_time": "N/A",
          "fields_detected": 0
        }
      }
    }
    ```

### `POST /api/detect-text` (Text Analyzer)
*   **Request Type**: `application/json`
*   **Request Body (JSON)**:
    ```json
    {
      "text": "The text payload to analyze (minimum 10 characters)"
    }
    ```
*   **Success Response (JSON)**:
    ```json
    {
      "filename": "Text Snippet",
      "type": "text/plain",
      "result": "HUMAN WRITTEN" | "AI GENERATED" | "UNCERTAIN",
      "confidence": 85.0,
      "details": {
        "model_used": "Stylometric NLP Pattern & Perplexity Analyzer",
        "sentences_analyzed": 3,
        "ai_probability": 15.0,
        "human_probability": 85.0,
        "ai_markers_count": 0,
        "human_markers_count": 2
      }
    }
    ```

---

## 2. Frontend Storage Schema (React)

The React frontend persists scan records directly in the browser's `localStorage` under the key `"scanHistory"`.

### `scanHistory` (Array of Objects)
```json
[
  {
    "id": 1715509930219,             
    "date": "2026-05-12 11:04",      
    "name": "portrait_sample.jpg",   
    "result": "REAL",            
    "confidence": 82.95               
  }
]
```
- **`id`**: Unique identifier (Unix Timestamp, integer)
- **`date`**: Formatted Date String (`YYYY-MM-DD HH:MM`)
- **`name`**: The name of the file or "Text Snippet" (string)
- **`result`**: The detection outcome (`REAL`, `DEEPFAKE`, `UNCERTAIN`, `AI GENERATED`, `HUMAN WRITTEN`)
- **`confidence`**: Inference confidence percentage (float/number)

## 3. High-Level Component Structure
*   **Upload Page (`Upload.jsx`)**: Handles media/text input, submits payload to FastAPI backend, and saves response to `localStorage`.
*   **Detector Component (`Detector.jsx`)**: Renders the multi-stage visual inspection steps, probability breakdown, face localization status, EXIF forensics, and handles `REAL`, `DEEPFAKE`, and `UNCERTAIN` states.
*   **Dashboard Page (`Dashboard.jsx`)**: Displays dynamic history, statistics widgets, and filterable audit tables.

