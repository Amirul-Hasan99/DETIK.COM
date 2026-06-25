@echo off
echo Starting Backend Server...
start cmd /k "cd backend && call venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"
echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo System started successfully! Both backend and frontend windows are open.
