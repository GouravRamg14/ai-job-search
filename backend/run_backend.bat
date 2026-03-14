@echo off
REM Run backend on Windows: activate venv, install deps, seed DB if needed, start server.
REM Usage: from backend\ run: run_backend.bat

cd /d "%~dp0"

if not exist "venv" (
  echo Creating virtual environment...
  python -m venv venv
)
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -q -r requirements.txt

if not exist "jobs.db" (
  echo Seeding database...
  python seed_db.py
)

echo Starting Flask server at http://127.0.0.1:5000
python app.py
pause
