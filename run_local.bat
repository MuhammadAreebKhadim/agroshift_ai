@echo off
echo ==========================================================
echo Starting AgroShift AI (NASA Space Apps Challenge)
echo ==========================================================

echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "AgroShift Backend" cmd /k "cd backend && .\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo Starting Next.js Frontend on http://localhost:3000 ...
start "AgroShift Frontend" cmd /k "cd frontend && npm run dev"

echo ==========================================================
echo Both services launched! 
echo Frontend: http://localhost:3000
echo Backend API Docs: http://127.0.0.1:8000/docs
echo ==========================================================
pause
