@echo off
chcp 65001 >nul
cls

echo ========================================
echo   Starting Recommendation Service (RS)
echo ========================================
echo.

cd /d %~dp0

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Please install Python first.
    pause
    exit /b 1
)

:: Check if model file exists
if not exist "recommendation_model.pkl" (
    echo [WARNING] Model file not found!
    echo.
    echo Creating model file... This may take a few minutes.
    echo.
    python initModel.py
    if errorlevel 1 (
        echo [ERROR] Failed to create model file!
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Model file created!
    echo.
)

echo [INFO] Starting Flask server on port 6000...
echo [INFO] Service will be available at: http://localhost:6000
echo.
echo Press Ctrl+C to stop the service
echo.

python main.py

pause

