# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack job discovery web app with AI-powered semantic search. React+Vite frontend, Flask+SQLite backend, scikit-learn for TF-IDF search/similarity ranking.

## Commands

### Frontend (run from `frontend/`)
```bash
npm run dev        # Dev server on port 5173
npm run build      # Production build to dist/
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (run from `backend/`, activate venv first)
```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 seed_db.py   # Initialize SQLite DB with sample data
python3 app.py       # Dev server on port 5000
```

### Production (backend)
```bash
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

## Architecture

### Frontend (`frontend/`)
- **React 19 + Vite 7** with React Router v7
- **Tailwind CSS v4** (dark theme, indigo brand colors)
- State: AuthContext (React Context) + localStorage for JWT (`jd_auth_token` key)
- API calls: native fetch, base URL from `VITE_API_URL` env var (defaults to `/api` for dev proxy)
- Dev proxy: Vite forwards `/api/*` to `http://127.0.0.1:5000`
- Pages in `src/pages/`, shared components in `src/components/`
- Protected routes wrapped with `RequireAuth` component

### Backend (`backend/`)
- **Flask 3** with Flask-CORS, Gunicorn for production
- **SQLite** single file (`jobs.db`) with tables: `jobs`, `users`, `job_applications`
- **Auth**: JWT (HS256, 7-day expiry) + optional Google OAuth via Authlib
- **AI Search**: TF-IDF Vectorizer with character n-grams (`analyzer='char_wb'`, `ngram_range=(3,5)`) + cosine similarity
- Main modules:
  - `app.py` — Job endpoints, search, similarity, filters
  - `auth.py` — Register, login, Google OAuth, password reset
  - `applications.py` — Job application tracking (CRUD)
  - `db_init.py` — Schema creation
  - `seed_db.py` — Sample data seeder

### API Endpoints
- `GET /api/jobs`, `GET /api/jobs/:id`, `GET /api/jobs/:id/similar`
- `GET /api/search?q=...&limit=20` (supports location, job_type, experience_level filters)
- `GET /api/filters` — Available filter values
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/auth/google`, `GET /api/auth/google/callback`
- `GET/POST/DELETE /api/applications` (JWT required)

### Deployment
- Frontend → **Vercel** (static SPA with `vercel.json` rewrite rules)
- Backend → **Render** (with Procfile, persistent disk for SQLite)

## Environment Variables

### Backend (`.env`)
- `FLASK_SECRET_KEY`, `JWT_SECRET_KEY` — Required secrets
- `ALLOWED_ORIGINS` — Comma-separated CORS origins
- `FRONTEND_URL`, `BACKEND_URL` — URLs for OAuth redirects
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Optional OAuth credentials
- `SQLITE_PATH` — Optional custom DB path (defaults to `backend/jobs.db`)

### Frontend
- `VITE_API_URL` — Backend URL for production (omit for dev proxy)
