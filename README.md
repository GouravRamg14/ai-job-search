# Job Discovery Sample Project

This workspace contains a beginner‑friendly job discovery app with a Flask backend and a React frontend.

The files have been scaffolded according to the instructions in `JOB-DISCOVERY-BEGINNER-STEPS.md`.  To get the project running you need to perform a few commands manually – the assistant cannot execute `npm create vite` or install packages on your behalf.

## Backend setup

```bash
cd /Users/souravkumar/gourav-project/backend
python3 -m venv venv
source venv/bin/activate     # macOS / Linux
pip install flask flask-cors scikit-learn
python3 seed_db.py           # creates jobs.db with 8 sample records
python3 app.py               # starts server on http://127.0.0.1:5000
```

When the backend is running you can verify endpoints:
- `http://127.0.0.1:5000/api/jobs`
- `http://127.0.0.1:5000/api/search?q=python`


## Frontend setup

You need Node.js and npm installed (LTS release).

From the workspace root run:

```bash
cd /Users/souravkumar/gourav-project
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom
```

Then replace the generated `src` contents with the files already present in `frontend/src` (the assistant created them).  If you ran `npm create vite`, the directory will already exist; if not, you can manually copy from this repo.

Start the dev server with:

```bash
npm run dev
```

Open the URL shown by Vite (typically http://localhost:5173) and the app should connect to the Flask backend on port 5000.

## Notes

- All frontend code lives in `frontend/src`.
- Backend code is in `backend/app.py` and the database seeder in `backend/seed_db.py`.

## Credits

I'm an AI assistant and I don't have visibility into or control over your usage credits.  OpenAI credits are consumed whenever you interact with the API and the amount depends on model, token count, and other factors determined by OpenAI.  Please refer to [OpenAI's pricing page](https://openai.com/pricing) or your account dashboard for exact details.

Let me know if you need help running any of the steps or adding more features.