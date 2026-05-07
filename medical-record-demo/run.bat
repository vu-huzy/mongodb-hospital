@echo off
chcp 65001 >nul
echo ==============================================
echo   🏥 HOSPITAL MEDICAL RECORD - STARTUP SCRIPT
echo ==============================================

echo.
echo [1/3] Đang kiểm tra và khởi động Backend...
cd "%~dp0backend"
if not exist "node_modules" (
    echo Đang cài đặt thư viện cho Backend (lần đầu)...
    call npm install
)
start "Backend Server" cmd /k "title Backend (Port 5000) && npm start"

echo.
echo [2/3] Đang kiểm tra và khởi động Frontend...
cd "%~dp0frontend"
if not exist "node_modules" (
    echo Đang cài đặt thư viện cho Frontend (lần đầu)...
    call npm install
)
start "Frontend Server" cmd /k "title Frontend (Port 5173) && npm run dev"

echo.
echo [3/3] Đang mở trình duyệt...
echo Vui lòng đợi vài giây để server khởi động hoàn tất...
timeout /t 5 /nobreak > nul
start http://localhost:5173

echo.
echo Hoàn thành! Hệ thống đang chạy.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
pause
