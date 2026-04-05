import os
import sqlite3

from dotenv import load_dotenv
from pathlib import Path

from db_init import ensure_jobs_schema
from db_path import get_db_path
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from auth import login as auth_login_view
from auth import register as auth_register_view
from auth import reset_password_simple as auth_reset_simple_view
from auth import register_auth
from applications import register_applications

load_dotenv(Path(__file__).resolve().parent / ".env")

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-only-change-FLASK_SECRET_KEY")

# Production: set ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
_cors_origins = [
    o.strip()
    for o in (os.environ.get("ALLOWED_ORIGINS") or "").split(",")
    if o.strip()
]
if _cors_origins:
    CORS(
        app,
        origins=_cors_origins,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )
else:
    CORS(app)  # dev: allow all

# Avoid 500 when jobs table is missing (e.g. seed step skipped). Empty table until seed runs.
ensure_jobs_schema()

register_auth(app)
register_applications(app)


@app.route("/health", methods=["GET"])
def health():
    """Load balancer / platform health (Render, etc.)."""
    return jsonify({"status": "ok"}), 200

# Short aliases (canonical routes are /api/auth/register and /api/auth/login)
app.add_url_rule("/api/register", "register_alias", auth_register_view, methods=["POST"])
app.add_url_rule("/api/login", "login_alias", auth_login_view, methods=["POST"])
app.add_url_rule(
    "/api/reset-password-simple",
    "reset_simple_alias",
    auth_reset_simple_view,
    methods=["POST"],
)
# Same handler — some clients expect /api/forgot-password for POST body { email, new_password }
app.add_url_rule(
    "/api/forgot-password",
    "forgot_password_simple_alias",
    auth_reset_simple_view,
    methods=["POST"],
)

# Load all jobs from SQLite into a list (we'll use this for AI)
def get_all_jobs():
    # Ensure schema on the same file we query (handles worker/cwd/path edge cases on Render).
    ensure_jobs_schema()
    conn = sqlite3.connect(str(get_db_path()))
    conn.row_factory = sqlite3.Row  # so we get dict-like rows
    c = conn.cursor()
    c.execute("SELECT * FROM jobs")
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Build one text string per job for TF-IDF (title, description, skills, location, job_type)
# Add remote/on-site synonyms so "remote" and "on-site" searches work
def job_to_text(job):
    loc = (job.get('location') or '').strip()
    parts = [
        job.get('title', ''),
        job.get('description', ''),
        job.get('skills', ''),
        job.get('job_type', ''),
        loc,
    ]
    text = ' '.join(parts)
    if loc.lower() == 'remote':
        text += ' remote work from home'
    else:
        text += ' on-site onsite in-office'
    return text

# ----- API routes -----

# 1) List all jobs (optional filter by job_type, location, company)
@app.route('/api/jobs', methods=['GET'])
def list_jobs():
    jobs = get_all_jobs()
    job_type = request.args.get('job_type')
    location = request.args.get('location')
    company = request.args.get('company')
    if job_type:
        jobs = [j for j in jobs if (j.get('job_type') or '').strip().lower() == job_type.lower()]
    if location:
        jobs = [j for j in jobs if location.lower() in (j.get('location') or '').lower()]
    if company:
        jobs = [j for j in jobs if (j.get('company') or '').strip().lower() == company.lower()]
    return jsonify(jobs)

# 2) One job by id
@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    jobs = get_all_jobs()
    job = next((j for j in jobs if j['id'] == job_id), None)
    if not job:
        return jsonify({"error": "Not found"}), 404
    return jsonify(job)

# 3) Similar jobs (AI)
@app.route('/api/jobs/<int:job_id>/similar', methods=['GET'])
def similar_jobs(job_id):
    jobs = get_all_jobs()
    job = next((j for j in jobs if j['id'] == job_id), None)
    if not job:
        return jsonify({"error": "Not found"}), 404

    texts = [job_to_text(j) for j in jobs]
    # Character n‑gram TF‑IDF makes this more robust to small typos
    vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5))
    matrix = vectorizer.fit_transform(texts)
    idx = next(i for i, j in enumerate(jobs) if j['id'] == job_id)
    sims = cosine_similarity(matrix[idx:idx+1], matrix)[0]
    # sort by similarity (desc), skip self (idx)
    order = sims.argsort()[::-1]
    top = [jobs[i] for i in order if i != idx][:4]
    return jsonify(top)

# 4) Filter options for LinkedIn-style filters (location, job type, experience_level)
@app.route('/api/filters', methods=['GET'])
def filters():
    jobs = get_all_jobs()
    locations = sorted({(j.get('location') or '').strip() for j in jobs if (j.get('location') or '').strip()})
    job_types = sorted({(j.get('job_type') or '').strip() for j in jobs if (j.get('job_type') or '').strip()})
    experience_levels = sorted({(j.get('experience_level') or '').strip() for j in jobs if (j.get('experience_level') or '').strip()})
    return jsonify({"locations": locations, "job_types": job_types, "experience_levels": experience_levels})

# 5) Smart search (AI) with optional location, job_type, experience_level filters
@app.route('/api/search', methods=['GET'])
def search():
    q = request.args.get('q', '').strip()
    limit = request.args.get('limit', default=20, type=int)
    location_filter = request.args.get('location', '').strip()
    job_type_filter = request.args.get('job_type', '').strip()
    experience_filter = request.args.get('experience_level', '').strip()

    jobs = get_all_jobs()

    if location_filter:
        jobs = [j for j in jobs if (j.get('location') or '').strip().lower() == location_filter.lower()]
    if job_type_filter:
        jobs = [j for j in jobs if (j.get('job_type') or '').strip().lower() == job_type_filter.lower()]
    if experience_filter:
        jobs = [j for j in jobs if (j.get('experience_level') or '').strip().lower() == experience_filter.lower()]

    if not q:
        return jsonify(jobs[:limit])

    texts = [job_to_text(j) for j in jobs]
    if not texts:
        return jsonify([])
    vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5))
    matrix = vectorizer.fit_transform(texts)
    q_vec = vectorizer.transform([q])
    sims = cosine_similarity(q_vec, matrix)[0]
    order = sims.argsort()[::-1]
    top_indices = order[:limit]
    results = [jobs[i] for i in top_indices]
    return jsonify(results)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
