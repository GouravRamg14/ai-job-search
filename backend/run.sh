#!/usr/bin/env bash
# Backend dev server (uses venv — no need for `python` on PATH).
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -x venv/bin/python ]]; then
  echo "Missing venv. Create it with:"
  echo "  python3 -m venv venv"
  echo "  ./venv/bin/pip install -r requirements.txt"
  exit 1
fi
exec ./venv/bin/python app.py "$@"
