@echo off
echo ==========================================
echo   Starting DayFlow HRMS
echo ==========================================
echo.

echo Checking MongoDB connection...
timeout /t 2 /nobreak >nul

echo Starting Backend Server...
start "DayFlow Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "DayFlow Frontend" cmd /k "cd frontend && npm start"

echo.
echo ==========================================
echo   DayFlow is starting!
echo ==========================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo The browser will open automatically.
echo.
echo To stop the servers, close the terminal windows.
echo.
