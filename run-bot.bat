@echo off
chcp 65001 > nul
title Telegram Chat Bot (@bsilend_bot)
cd /d "%~dp0\bot"
echo ========================================================
echo  🚀 Запуск разговорного Telegram-бота (@bsilend_bot)
echo ========================================================
echo.
npm start
pause
