# Deployment guide

## Tech stack (what runs where)

| Layer | Technology | Best host |
|--------|------------|-----------|
| **UI** | React 19, Vite 7, Tailwind, React Router | **Vercel** (static + SPA routing) |
| **API** | Flask 3, flask-cors, Gunicorn | **Render**, Railway, Fly.io, or any Python host |
| **Search / ML** | scikit-learn (TF‑IDF + cosine similarity) | Same as API (CPU; needs ~512MB+ RAM for cold start) |
| **Data** | SQLite (`jobs.db` — jobs + users + applications) | Bundled on API server; see **Persistence** below |
| **Auth** | JWT, optional Google OAuth (Authlib) | Configured via env on the API |

**Why not the whole app on Vercel?**

- Vercel is ideal for the **Vite build** (`frontend/dist`).
- The **Flask** app is a long‑running WSGI service with **SQLite** and **heavy Python deps** (scikit-learn). Vercel’s **serverless Python** model uses an **ephemeral filesystem** and **tight size/time limits**, so running this API as‑is on Vercel is unreliable. The usual pattern is **Vercel (frontend) + managed Python host (API)**.

---

## 1. Deploy the API (Render)

1. Push this repo to GitHub.
2. In [Render](https://render.com), **New → Blueprint** and connect the repo, or **New → Web Service**:
   - **Root directory:** `backend`
   - **Build:** `pip install -r requirements.txt && python seed_db.py`
   - **Start:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Health check path:** `/health`
3. After the service is live, note the URL, e.g. `https://ai-job-search-api.onrender.com`.

4. **Environment variables** (Render → Environment):

   | Variable | Purpose |
   |----------|---------|
   | `ALLOWED_ORIGINS` | Comma-separated origins allowed for CORS, e.g. `https://your-app.vercel.app` |
   | `FRONTEND_URL` | Your Vercel site URL (OAuth redirect after login) |
   | `BACKEND_URL` | This Render service URL (OAuth `redirect_uri` base) |
   | `FLASK_SECRET_KEY` | Long random string |
   | `JWT_SECRET_KEY` | Long random string (different from Flask secret) |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional; for Google sign-in |

5. In **Google Cloud Console** (if using OAuth), add **Authorized redirect URI**:
   `https://<YOUR-RENDER-HOST>/api/auth/google/callback`

**Persistence:** On free tiers, disks can be ephemeral. Treat SQLite as **non-durable** across restarts. For production, plan a move to **PostgreSQL** (e.g. Neon, Supabase, Render Postgres).

---

## 2. Deploy the frontend (Vercel)

1. [Vercel](https://vercel.com) → **Add New Project** → import the same GitHub repo.
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite (auto-detected).
4. **Build Command:** `npm run build` (default).
5. **Output Directory:** `dist`
6. **Environment Variables:**

   | Name | Example |
   |------|---------|
   | `VITE_API_URL` | `https://ai-job-search-api.onrender.com` |

   Do **not** include `/api` at the end; the app appends `/api` to requests.

7. Deploy. Set **`FRONTEND_URL`** and **`ALLOWED_ORIGINS`** on Render to your production Vercel URL (e.g. `https://job-discovery.vercel.app`).

`frontend/vercel.json` configures SPA fallback so client-side routes (`/job/123`, `/login`, etc.) work on refresh.

---

## 3. Verify

- Open `https://<vercel-app>/` — jobs should load if the API URL is correct and CORS allows your Vercel origin.
- `curl https://<render-api>/health` → `{"status":"ok"}`
- `curl https://<render-api>/api/filters` → JSON with filter options

---

## Optional: `render.yaml`

A starter Blueprint is in the repo root. You may need to add secrets and uncomment/adjust `envVars` in the Render dashboard after the first deploy.

---

## Local production-like check

```bash
# Terminal 1 — API
cd backend && pip install -r requirements.txt && python seed_db.py && gunicorn app:app --bind 127.0.0.1:5000

# Terminal 2 — UI with production API
cd frontend && VITE_API_URL=http://127.0.0.1:5000 npm run build && npx vite preview --port 4173
```

Open the preview URL and confirm search and auth against the local API.
