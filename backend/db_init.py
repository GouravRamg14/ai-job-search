"""Ensure SQLite schema exists so API routes do not 500 when seed_db did not run."""
from __future__ import annotations

import sqlite3

from db_path import get_db_path

JOBS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    company TEXT,
    location TEXT,
    job_type TEXT,
    description TEXT,
    skills TEXT,
    image_url TEXT,
    posted_at TEXT,
    salary TEXT,
    experience_level TEXT,
    apply_url TEXT
)
"""


def ensure_jobs_schema() -> None:
    conn = sqlite3.connect(str(get_db_path()))
    try:
        conn.execute(JOBS_TABLE_SQL)
        conn.commit()
    finally:
        conn.close()
