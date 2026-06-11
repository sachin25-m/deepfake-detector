# Deepfake Detector Schema & Architecture

This document outlines the API endpoints, data models, and storage structure used in the Deepfake Detector application.

## 1. Backend API Schema (FastAPI)

The backend exposes three main endpoints. It runs locally on `http://127.0.0.1:8000`.

### `GET /` (Health Check)
*   **Request Body**: None
*   **Response**: 
    ```json
    {
      "message": "Deepfake Detection API Simulation is running."
    }
    ```

### `POST /api/detect` (Media Scanner)
*   **Request Type**: `multipart/form-data`
*   **Request Body**: `file` (An Image or Video file)
*   **Success Response (JSON)**:
    ```json
    {
      "filename": "string (e.g., photo.jpg)",
      "type": "string (e.g., image/jpeg)",
      "result": "DEEPFAKE" | "REAL",
      "confidence": 95.0,
      "details": {
        "model_used": "string (Model architecture name)",
        "faces_detected": "integer (1-3)",
        "artifacts_found": "integer (e.g., 12)"
      }
    }
    ```

### `POST /api/detect-text` (Text Analyzer)
*   **Request Type**: `application/json`
*   **Request Body (JSON)**:
    ```json
    {
      "text": "string (The text payload to analyze, min 10 chars)"
    }
    ```
*   **Success Response (JSON)**:
    ```json
    {
      "filename": "Text Snippet",
      "type": "text/plain",
      "result": "AI GENERATED" | "HUMAN WRITTEN",
      "confidence": 92.5,
      "details": {
        "model_used": "string (Model architecture name)",
        "sentences_analyzed": "integer",
        "artifacts_found": "integer (AI keyword hit count)"
      }
    }
    ```

---

## 2. Frontend Storage Schema (React)

The React frontend persists data directly in the browser's `localStorage` under the key `"scanHistory"`. This acts as the local database for the Dashboard.

### `scanHistory` (Array of Objects)
```json
[
  {
    "id": 1715509930219,             
    "date": "2026-05-12 11:04",      
    "name": "video_interview.mp4",   
    "result": "DEEPFAKE",            
    "confidence": 94.2               
  }
]
```
- **`id`**: Unique identifier (Unix Timestamp, integer)
- **`date`**: Formatted Date String (`YYYY-MM-DD HH:MM`)
- **`name`**: The name of the file or "Text Snippet" (string)
- **`result`**: The detection outcome (`DEEPFAKE`, `REAL`, `AI GENERATED`, or `HUMAN WRITTEN`)
- **`confidence`**: Detection confidence percentage (float/number)

## 3. High-Level Component Structure
*   **Upload Page (`Upload.jsx`)**: Handles user input (drag-and-drop or text), validates files locally, formats the payload for the API, and saves successful responses to `localStorage`.
*   **Detector Component (`Detector.jsx`)**: The UI stepper that fakes the "neural scan" loading animations and displays the JSON response from the backend.
*   **Dashboard Page (`Dashboard.jsx`)**: Reads the `scanHistory` array from `localStorage` to populate the stats widgets and the recent activity table.
