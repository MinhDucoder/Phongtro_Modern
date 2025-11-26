@echo off
chcp 65001 >nul
cls

:: Lay duong dan thu muc chua file .bat
set PROJECT_ROOT=%~dp0

echo Starting all services...
echo.

:: Khoi dong Backend
echo [1/3] Starting Backend Server...
start "Backend" cmd /k "cd /d %PROJECT_ROOT%server && npm run dev"

timeout /t 2 /nobreak > nul

:: Khoi dong Frontend
echo [2/3] Starting Frontend Server...
start "Frontend" cmd /k "cd /d %PROJECT_ROOT%phongtro-modern && npm run dev"

timeout /t 2 /nobreak > nul

:: Khoi dong RS-Posts
echo [3/3] Starting RS-Posts...
start "RS-Posts" cmd /k "cd /d %PROJECT_ROOT%RS\RS_Posts && env\Scripts\activate && python main.py"

timeout /t 1 /nobreak > nul

echo.
echo All services started!
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo - RS-Posts: http://localhost:5001
echo.
pause
