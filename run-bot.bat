@echo off
chcp 65001 > nul
title FlipClip Telegram Bot • Cloud MyStat
cd /d "%~dp0\bot"
echo ========================================================
echo  🚀 Запуск Telegram-бота FlipClip (@FlipClip_bot)
echo  🔑 Application Key Клауда: 6a56a5df2667e65aab73ce...
echo ========================================================
echo.
npm start
pause
