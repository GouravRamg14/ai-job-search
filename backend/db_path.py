"""
Single source of truth for the SQLite file path (jobs, users, applications).

Local default: backend/jobs.db

Production (Render): set SQLITE_PATH to a persistent path, e.g. /var/data/jobs.db
when you attach a Render Disk to the web service.
"""
from __future__ import annotations

import os
from pathlib import Path


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


DB_PATH = get_db_path()
