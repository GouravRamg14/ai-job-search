# Job Discovery Sample Project

This workspace contains a beginner‑friendly job discovery app with a Flask backend and a React frontend. The project is set up to run on **macOS, Linux, and Windows**.

The files have been scaffolded according to the instructions in `JOB-DISCOVERY-BEGINNER-STEPS.md`. To get the project running you need to perform a few commands manually – the assistant cannot execute `npm create vite` or install packages on your behalf.

## Backend setup

Use the path to your project (e.g. `C:\Users\YourName\gourav-project` on Windows, or `/path/to/gourav-project` on Mac/Linux).

### macOS / Linux

```bash
cd /path/to/gourav-project/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 seed_db.py    # creates jobs.db with sample records
python3 app.py        # starts server on http://127.0.0.1:5000
```

### Windows (Command Prompt)

```cmd
cd C:\path\to\gourav-project\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed_db.py     # creates jobs.db with sample records
python app.py         # starts server on http://127.0.0.1:5000
```

### Windows (PowerShell)

```powershell
cd C:\path\to\gourav-project\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python seed_db.py     # creates jobs.db with sample records
python app.py         # starts server on http://127.0.0.1:5000
```

When the backend is running you can verify endpoints:
- `http://127.0.0.1:5000/api/jobs`
- `http://127.0.0.1:5000/api/search?q=python`


## Frontend setup

You need **Node.js 21 or newer** (e.g. Node 22 LTS from [nodejs.org](https://nodejs.org/)). Vite 7 requires this for `crypto.hash` support; older Node (18/20) will show crypto errors. Check with `node -v`.

From the workspace root run (same on macOS, Linux, and Windows):

```bash
cd /path/to/gourav-project
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom
```

Then replace the generated `src` contents with the files already present in `frontend/src` (the assistant created them). If you ran `npm create vite`, the directory will already exist; if not, you can manually copy from this repo.

Start the dev server with:

```bash
npm run dev
```

Open the URL shown by Vite (typically http://localhost:5173) and the app should connect to the Flask backend on port 5000.

## Optional: run scripts

- **Backend:** macOS/Linux: `./run_backend.sh` from `backend/`. Windows: `run_backend.bat` from `backend/`.
- **Frontend (Windows):** from `frontend/` run `run_frontend.bat` to install deps and start the dev server with `npx vite`. If `npm run dev` fails on Windows, this script or running `npx vite` from `frontend` often works; ensure Node is in PATH and use Command Prompt if PowerShell blocks scripts.

## Notes

- All frontend code lives in `frontend/src`.
- Backend code is in `backend/app.py` and the database seeder in `backend/seed_db.py`.
- The backend uses cross-platform paths so the database works on both Mac and Windows.

## Credits

I'm an AI assistant and I don't have visibility into or control over your usage credits.  OpenAI credits are consumed whenever you interact with the API and the amount depends on model, token count, and other factors determined by OpenAI.  Please refer to [OpenAI's pricing page](https://openai.com/pricing) or your account dashboard for exact details.

Let me know if you need help running any of the steps or adding more features.