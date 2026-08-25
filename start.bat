@echo off
title PrepAce Launcher
echo ===================================================
echo   PrepAce: AI Mock Interview Platform Launcher
echo ===================================================
echo.

echo Launching Python AI Service (Port 8000)...
start "PrepAce - AI Service (8000)" cmd /k "cd /d %~dp0ai_service && .\venv\Scripts\activate && python main.py"

echo Launching Spring Boot Backend (Port 8085)...
start "PrepAce - Backend (8085)" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

echo Launching React Frontend (Port 5173)...
start "PrepAce - Frontend (5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo 
pause
