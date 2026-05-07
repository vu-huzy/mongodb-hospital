@echo off
echo ==============================================
echo   HOSPITAL MEDICAL RECORD - STARTUP SCRIPT
echo ==============================================

echo.
echo [1/3] Checking and starting Backend...
cd /d "%~dp0backend"
if not exist "node_modules" (
    echo Installing Backend dependencies...
    call npm install
)
start "Backend Server" cmd /k "title Backend (Port 5000) && npm start"

echo.
echo [2/3] Checking and starting Frontend...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing Frontend dependencies...
    call npm install
)
start "Frontend Server" cmd /k "title Frontend (Port 5173) && npm run dev"

echo.
echo [3/3] Opening Browser...
echo Please wait a few seconds for the servers to start...
timeout /t 5 /nobreak > nul
start http://localhost:5173

echo.
echo Done! System is starting up.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
pause
