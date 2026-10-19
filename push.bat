@echo off
chcp 65001 > nul
echo ========================================================
echo   Отправка проекта Journal 2.0 на GitHub
echo ========================================================
echo.
cd /d "%~dp0"
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"

echo Отправка файлов в репозиторий https://github.com/shakehor-coder/JOURNAL2.0 ...
echo.
git push -u origin main

if %errorlevel% equ 0 (
  echo.
  echo ========================================================
  echo  [УСПЕХ] Проект успешно опубликован на GitHub!
  echo  Ссылка: https://github.com/shakehor-coder/JOURNAL2.0
  echo ========================================================
) else (
  echo.
  echo [ИНФО] Если открылось окно браузера - подтвердите вход.
)

echo.
pause
