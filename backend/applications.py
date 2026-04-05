"""Per-user job applications stored in SQLite."""
import random
import sqlite3
import string
import time

from flask import Blueprint, g, jsonify, request

from auth import require_auth
from db_path import get_db_path

applications_bp = Blueprint("applications", __name__, url_prefix="/api/applications")

NUM_STAGES = 5


def _conn():
    conn = sqlite3.connect(str(get_db_path()))
    conn.row_factory = sqlite3.Row
    return conn


def init_job_applications_table():
    conn = sqlite3.connect(str(get_db_path()))
    c = conn.cursor()
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS job_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            job_id INTEGER NOT NULL,
            ref_id TEXT NOT NULL,
            progress_stage INTEGER NOT NULL DEFAULT 0,
            applied_at TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE (user_id, job_id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """
    )
    c.execute("CREATE INDEX IF NOT EXISTS idx_job_apps_user ON job_applications(user_id)")
    conn.commit()
    conn.close()


def gen_ref() -> str:
    t = format(int(time.time() * 1000) % 0xFFFFFFF, "X")[-5:].upper()
    r = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"JD-{t}-{r}"


def _job_exists(job_id: int) -> bool:
    conn = _conn()
    row = conn.execute("SELECT 1 FROM jobs WHERE id = ?", (job_id,)).fetchone()
    conn.close()
    return row is not None


def _application_row_to_json(row) -> dict:
    d = dict(row)
    job = {
        "id": d["job_id"],
        "title": d["title"],
        "company": d["company"],
        "location": d["location"],
        "job_type": d["job_type"],
        "salary": d["salary"],
        "image_url": d["image_url"],
    }
    return {
        "id": d["id"],
        "job_id": d["job_id"],
        "ref_id": d["ref_id"],
        "progress_stage": d["progress_stage"],
        "applied_at": d["applied_at"],
        "job": job,
    }


def _fetch_application(user_id: int, job_id: int):
    conn = _conn()
    row = conn.execute(
        """
        SELECT ja.id, ja.job_id, ja.ref_id, ja.progress_stage, ja.applied_at,
               j.title, j.company, j.location, j.job_type, j.salary, j.image_url
        FROM job_applications ja
        JOIN jobs j ON j.id = ja.job_id
        WHERE ja.user_id = ? AND ja.job_id = ?
        """,
        (user_id, job_id),
    ).fetchone()
    conn.close()
    return row


@applications_bp.route("", methods=["GET"])
@require_auth
def list_applications():
    uid = g.user["id"]
    conn = _conn()
    rows = conn.execute(
        """
        SELECT ja.id, ja.job_id, ja.ref_id, ja.progress_stage, ja.applied_at,
               j.title, j.company, j.location, j.job_type, j.salary, j.image_url
        FROM job_applications ja
        JOIN jobs j ON j.id = ja.job_id
        WHERE ja.user_id = ?
        ORDER BY ja.applied_at DESC
        """,
        (uid,),
    ).fetchall()
    conn.close()
    return jsonify({"applications": [_application_row_to_json(r) for r in rows]})


@applications_bp.route("", methods=["POST"])
@require_auth
def create_application():
    body = request.get_json(silent=True) or {}
    try:
        job_id = int(body.get("job_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "job_id is required"}), 400

    if not _job_exists(job_id):
        return jsonify({"error": "Job not found"}), 404

    uid = g.user["id"]
    ref = gen_ref()
    stage = random.randint(0, NUM_STAGES - 1)

    conn = _conn()
    try:
        conn.execute(
            """
            INSERT INTO job_applications (user_id, job_id, ref_id, progress_stage, applied_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id, job_id) DO UPDATE SET
                ref_id = excluded.ref_id,
                progress_stage = excluded.progress_stage,
                applied_at = datetime('now')
            """,
            (uid, job_id, ref, stage),
        )
        conn.commit()
    except sqlite3.OperationalError as e:
        return jsonify({"error": "Could not save application", "detail": str(e)}), 500
    finally:
        conn.close()

    row = _fetch_application(uid, job_id)
    if not row:
        return jsonify({"error": "Could not load application"}), 500
    return jsonify({"application": _application_row_to_json(row)})


@applications_bp.route("/<int:job_id>", methods=["DELETE"])
@require_auth
def delete_application(job_id):
    uid = g.user["id"]
    conn = _conn()
    cur = conn.execute(
        "DELETE FROM job_applications WHERE user_id = ? AND job_id = ?",
        (uid, job_id),
    )
    conn.commit()
    deleted = cur.rowcount
    conn.close()
    if not deleted:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"ok": True})


def register_applications(app):
    init_job_applications_table()
    app.register_blueprint(applications_bp)
