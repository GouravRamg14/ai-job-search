#!/usr/bin/env bash
# Run backend on macOS/Linux: activate venv, install deps, seed DB if needed, start server.
# Usage: from backend/ run: ./run_backend.sh

set -e
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi
source venv/bin/activate

echo "Installing dependencies..."
pip install -q -r requirements.txt

if [ ! -f "jobs.db" ]; then
  echo "Seeding database..."
  python3 seed_db.py
fi

echo "Starting Flask server at http://127.0.0.1:5000"
python3 app.py
