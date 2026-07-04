@echo off
echo ==============================================
echo POS System - Dev Server Restarter
echo ==============================================
echo.
echo [1/2] Terminating any existing local sessions on port 3000...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo Killing process ID %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo [2/2] Starting fresh Next.js development server...
echo.
npm run dev
pause
