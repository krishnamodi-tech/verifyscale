@echo off
title VerifyScale - SIH 2026 Prototype Launcher
echo =====================================================================
echo   VERIFYSCALE - ONLINE VERIFICATION SYSTEM FOR WEIGHING INSTRUMENTS
echo   Smart India Hackathon 2026 - Problem Statement SIH26036
echo   Team: NEXUS NOVA
echo =====================================================================
echo.
echo Launching prototype in your browser...
cd /d "%~dp0"
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Python not found in standard PATH, opening index.html directly...
    start index.html
)
pause
