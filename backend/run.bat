@echo off
cd /d "%~dp0"
if not exist "venv\Scripts\python.exe" (
  echo Missing venv. Run: python -m venv venv ^&^& venv\Scripts\pip install -r requirements.txt
  exit /b 1
)
venv\Scripts\python.exe app.py %*
