Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Starting AgroShift AI (NASA Space Apps Challenge)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

Write-Host "Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 2

Write-Host "Starting Next.js Frontend on http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "Both services launched successfully!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
