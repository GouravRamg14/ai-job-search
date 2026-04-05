"""
Single source of truth for the SQLite file path (jobs, users, applications).

Load .env before reading SQLITE_PATH so imports work even when auth loads
before app.load_dotenv() (e.g. Gunicorn workers).
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env", override=False)


def get_db_path() -> Path:
    raw = (os.environ.get("SQLITE_PATH") or os.environ.get("DATABASE_PATH") or "").strip()
    if raw:
        p = Path(raw).expanduser()
        parent = p.parent
        if parent and not parent.exists():
            try:
                parent.mkdir(parents=True, exist_ok=True)
            except OSError:
                pass
        return p.resolve()
    return Path(__file__).resolve().parent / "jobs.db"


# Resolved at import time (after load_dotenv above). Use get_db_path() when you need a fresh path.
DB_PATH = get_db_path()
