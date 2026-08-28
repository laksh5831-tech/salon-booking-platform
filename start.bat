@echo off
title Velora - Salon Booking Platform
echo.
echo  ========================================
echo     Velora - Salon Booking Platform
echo  ========================================
echo.
echo  [1] Start Backend (Port 5000)
echo  [2] Start Web App (Port 5173)
echo  [3] Seed Database
echo  [4] Start Backend + Web App Together
echo  [5] Install All Dependencies
echo  [6] Exit
echo.
set /p choice="Choose an option: "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto web
if "%choice%"=="3" goto seed
if "%choice%"=="4" goto both
if "%choice%"=="5" goto install
if "%choice%"=="6" exit

:backend
cd /d "%~dp0backend"
echo Starting backend server...
call npm run dev
goto end

:web
cd /d "%~dp0apps\web"
echo Starting web app...
call npm run dev
goto end

:seed
cd /d "%~dp0backend"
echo Seeding database...
call npm run seed
echo.
echo Done! You can close this window.
pause
goto end

:both
echo Starting backend...
start "Velora Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
echo Starting web app...
start "Velora Web" cmd /k "cd /d "%~dp0apps\web" && npm run dev"
echo.
echo Both servers started!
echo   Backend: http://localhost:5000
echo   Web App: http://localhost:5173
echo.
timeout /t 3 >nul
exit

:install
echo Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
echo.
echo Installing web app dependencies...
cd /d "%~dp0apps\web"
call npm install
echo.
echo Installing mobile app dependencies...
cd /d "%~dp0apps\mobile"
call npm install
echo.
echo All dependencies installed!
pause
goto end

:end
