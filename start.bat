@echo off
echo.
echo Starting Library Management System...
echo.

REM Start Backend
echo Starting Backend Server (Port 5000)...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm start"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start Frontend
echo Starting Frontend Server (Port 3000)...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ============================================
echo Application is starting!
echo ============================================
echo.
echo Web Browser: http://localhost:3000
echo Backend API: http://localhost:5000
echo.
echo LOGIN CREDENTIALS:
echo Admin User:
echo   Username: admin
echo   Password: admin123
echo.
echo Regular User:
echo   Username: user
echo   Password: user123
echo.
echo Press Enter to close this window...
pause
