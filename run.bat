@echo off
chcp 65001 > nul
echo ========================================================
echo   Запуск Journal 2.0 (Компьютерная Академия ТОП)
echo ========================================================
echo.
cd /d "%~dp0server"

REM Проверяем наличие node.exe
where node >nul 2>nul
if %errorlevel% neq 0 (
  if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
  ) else (
    echo [ОШИБКА] Node.js не найден в системе.
    echo Пожалуйста, установите Node.js с официального сайта: https://nodejs.org
    pause
    exit /b 1
  )
)

if not exist "node_modules" (
  echo [ИНФО] Первичная настройка зависимостей сервера...
  call npm install --omit=dev
)

echo Запуск сервера на http://localhost:5000 ...
start http://localhost:5000
node src/index.js
pause
