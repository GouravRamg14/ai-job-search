# Job Discovery + AI — Simple System Design

**Title:** *Smart Job Discovery — AI Search & Similar Jobs*

---

**What it does:** Browse jobs, search in plain language, open a job and see “Similar jobs”. Data in **SQLite** (no external API). Shortlist saved in browser (localStorage).

---

## Architecture

```
React (Vite)  →  Flask (Python)  →  SQLite (jobs)
```

- **Frontend:** React — Home, Job list, Job detail (with “Similar jobs”), Shortlist.
- **Backend:** Flask — reads jobs from SQLite, runs AI for search and similar jobs.
- **Data:** One SQLite file, one table: `jobs`.

---

## Tech Stack

| Part | Use |
|------|-----|
| Frontend | React (Vite) |
| Backend | Flask |
| Database | SQLite |
| AI (search + similar) | scikit-learn (TfidfVectorizer + cosine_similarity) |

---

## Database — One Table: `jobs`

| Column | Type |
|--------|------|
| id | INTEGER (primary key) |
| title | TEXT |
| company | TEXT |
| location | TEXT |
| job_type | TEXT (e.g. Internship, Full-time) |
| description | TEXT |
| skills | TEXT (e.g. "Python, React, SQL") |

Add 30–50 sample jobs. Shortlist = frontend only (React state + localStorage).

---

## API (4 endpoints)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/jobs` | List all jobs (optional `?job_type=Internship` or `?location=Remote`) |
| `GET /api/jobs/:id` | One job by id |
| `GET /api/jobs/:id/similar` | Top 4 similar jobs (AI) |
| `GET /api/search?q=...` | Smart search — ranked list (AI) |

---

## AI (same idea for both)

- **Search:** Turn each job (title + description + skills) into a vector. Turn user query into a vector. Rank jobs by similarity to the query.
- **Similar jobs:** For one job, find other jobs whose vectors are most similar (e.g. top 4).

Use **TF-IDF** to build vectors and **cosine similarity** (scikit-learn) to compare.

---

## Build Steps

1. **Setup** — Create `frontend/` (React Vite) and `backend/` (Flask). Install: Flask, flask-cors, scikit-learn.
2. **SQLite** — Create `jobs` table and add 30–50 sample rows.
3. **Backend** — Four routes: list jobs, job by id, similar jobs, search. Load jobs from SQLite; use TF-IDF + cosine for search and similar.
4. **Frontend** — Job list page, search bar, job detail page with “Similar jobs” block, shortlist (state + localStorage).
5. **Polish** — Simple styling, README with how to run and seed data.

---

## What to say in assignment

“A job discovery app: users browse and search jobs, open a job and see similar jobs. Backend is Flask with SQLite; frontend is React. There is no external API — all data is in SQLite. The AI part uses TF-IDF and cosine similarity for smart search and for finding similar jobs.”
