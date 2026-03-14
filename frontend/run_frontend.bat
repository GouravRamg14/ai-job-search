@echo off
REM Run frontend dev server on Windows.
REM Usage: double-click this file, or from frontend folder run: run_frontend.bat

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not in PATH.
  echo Install Node.js from https://nodejs.org/ and ensure "Add to PATH" is checked.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Starting Vite dev server at http://localhost:5173
echo Make sure the backend is running on http://127.0.0.1:5000
echo.
call npx vite
pause
