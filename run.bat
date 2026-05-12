@echo off
echo =========================================
echo Starting Deepfake Detection System...
echo =========================================

echo.
echo [1/2] Starting FastAPI Backend on port 8000...
start cmd /k "cd backend && .\venv\Scripts\activate && uvicorn main:app --reload --host 127.0.0.1 --port 8000"

echo [2/2] Starting React Vite Frontend on port 5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo Servers are booting up in separate command windows!
echo - Frontend URL: http://localhost:5173
echo - Backend API : http://127.0.0.1:8000/docs
echo.
pause
