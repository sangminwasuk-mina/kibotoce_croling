@echo off
cd /d "%~dp0"
title MULTIVERSE ARCHIVE Server
echo ===================================================
echo   MULTIVERSE ARCHIVE - LOCAL GAME SERVER
echo ===================================================
echo.
echo Starting local game server on port 8080...
start "" "http://localhost:8080"
node server.js
pause
