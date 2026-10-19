@echo off
chcp 65001 > nul
echo ========================================================
echo   Запуск Journal 2.0 в режиме разработки (Dev Mode)
echo ========================================================
echo.
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel% neq 0 (
  if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
  )
)

echo 1. Запуск бэкенда (порт 5000)...
start "Journal Backend" cmd /k "cd server && node src/index.js"

echo 2. Запуск фронтенда Vite (порт 5173)...
cd client
call npm run dev
pause
