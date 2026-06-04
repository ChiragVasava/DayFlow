@echo off
echo ==========================================
echo   DayFlow HRMS - Installation Script
echo ==========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed successfully
echo.

echo [2/4] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed successfully
echo.

echo [3/4] Setting up environment files...
cd ..\backend
if not exist .env (
    copy .env.example .env
    echo ✓ Created backend .env file
) else (
    echo ✓ Backend .env file already exists
)
cd ..
echo.

echo [4/4] Installation Complete!
echo.
echo ==========================================
echo   Next Steps:
echo ==========================================
echo 1. Make sure MongoDB is running
echo 2. Run 'start-dayflow.bat' to start the application
echo 3. Open http://localhost:3000 in your browser
echo.
echo Press any key to exit...
pause >nul
