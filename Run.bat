@echo off
title Velora
cd /d "%~dp0backend"
start "Velora Backend" cmd /k "npm run dev"
cd /d "%~dp0apps\web"
start "Velora Web" cmd /k "npm run dev"
echo.
echo  Backend: http://localhost:5000
echo  Web App: http://localhost:5173
echo.
echo  Open http://localhost:5173 in your browser
echo.
timeout /t 3 >nul
exit
