# Job Discovery Project — Steps for Absolute Beginners

Follow these steps in order. Each step has commands you can copy-paste into your terminal.

---

## Before You Start — Install These (if you don’t have them)

### 1. Node.js (for React frontend)
- Download from: https://nodejs.org (use the LTS version).
- After installing, open a **new** terminal and run:
  ```bash
  node -v
  npm -v
  ```
  You should see version numbers. If you get "command not found", Node is not installed correctly.

### 2. Python (for Flask backend)
- You need **Python 3.8 or higher**.
- Check:
  ```bash
  python3 --version
  ```
  If it’s missing, install from https://www.python.org/downloads/ (or on Mac you can try `brew install python3`).

### 3. Project folder
- Open terminal, go to where you want the project (e.g. Desktop or your `gourav-project` folder).
  ```bash
  cd /Users/souravkumar/gourav-project
  ```
  You will create everything inside this folder.

---

## Step 1 — Create Backend Folder and Install Python Packages

**What we do:** Create a `backend` folder and install Flask, flask-cors, and scikit-learn.

1. Create the backend folder and go into it:
   ```bash
   mkdir backend
   cd backend
   ```

2. Create a virtual environment (so project packages don’t mix with system Python):
   ```bash
   python3 -m venv venv
   ```
   This creates a folder named `venv`.

3. Activate the virtual environment:
   - **On Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```
   - **On Windows:**
     ```bash
     venv\Scripts\activate
     ```
   After this, your terminal prompt often shows `(venv)`.

4. Install packages:
   ```bash
   pip install flask flask-cors scikit-learn
   ```

5. Create an empty `app.py` file in `backend` (we will fill it in Step 3):
   ```bash
   touch app.py
   ```
   Or create a file named `app.py` in the `backend` folder with your editor and leave it empty for now.

---

## Step 2 — Create SQLite Database and Add Sample Jobs

**What we do:** Create a SQLite database file and a table `jobs`, then add sample data using a Python script.

1. Stay inside `backend` (with `venv` activated). Create a file named `seed_db.py` with the content below. You can use any text editor or IDE.

**File: `backend/seed_db.py`**

```python
import sqlite3

# Creates jobs.db and jobs table
conn = sqlite3.connect('jobs.db')
c = conn.cursor()

c.execute('''
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    company TEXT,
    location TEXT,
    job_type TEXT,
    description TEXT,
    skills TEXT
)
''')

# Sample jobs (you can add more later)
jobs = [
    ("Backend Developer", "TechCorp", "Bangalore", "Full-time", "Build APIs and services.", "Python, Flask, SQL"),
    ("Frontend Intern", "WebSolutions", "Mumbai", "Internship", "Work on React and UI.", "React, JavaScript, CSS"),
    ("Full Stack Developer", "StartupXYZ", "Remote", "Full-time", "End-to-end web development.", "Python, React, Node, SQL"),
    ("Data Analyst Intern", "DataCo", "Hyderabad", "Internship", "Analyze data and build reports.", "Python, SQL, Excel"),
    ("Python Developer", "DevHub", "Bangalore", "Full-time", "Backend development in Python.", "Python, Django, PostgreSQL"),
    ("React Developer", "UIFirst", "Remote", "Part-time", "Build React components.", "React, TypeScript, HTML"),
    ("Software Engineer", "BigTech", "Mumbai", "Full-time", "Design and develop software.", "Java, Python, SQL, AWS"),
    ("Web Development Intern", "LearnDev", "Pune", "Internship", "Learn and build small projects.", "HTML, CSS, JavaScript"),
]

for j in jobs:
    c.execute("INSERT INTO jobs (title, company, location, job_type, description, skills) VALUES (?,?,?,?,?,?)", j)

conn.commit()
conn.close()
print("Done! jobs.db created with", len(jobs), "jobs.")
```

2. Run the script to create the database and insert sample jobs:
   ```bash
   python3 seed_db.py
   ```
   You should see: `Done! jobs.db created with 8 jobs.`

3. Check: In the `backend` folder you should now see a file named `jobs.db`. That is your database.

**Tip:** You can run `python3 seed_db.py` again later after adding more rows to the `jobs` list to add more jobs (you might want to clear the table first or use a different script so you don’t duplicate rows).

---

## Step 3 — Write the Flask Backend (All 4 APIs)

**What we do:** Implement the 4 API endpoints in Flask and add the AI (TF-IDF + cosine similarity) for search and similar jobs.

Create or replace **`backend/app.py`** with the code below. Read the comments to see which part does what.

**File: `backend/app.py`**

```python
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)  # allows React to call this backend

# Load all jobs from SQLite into a list (we'll use this for AI)
def get_all_jobs():
    conn = sqlite3.connect('jobs.db')
    conn.row_factory = sqlite3.Row  # so we get dict-like rows
    c = conn.cursor()
    c.execute("SELECT * FROM jobs")
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Build one text string per job for TF-IDF (title + description + skills)
def job_to_text(job):
    return f"{job.get('title','')} {job.get('description','')} {job.get('skills','')}"

# ----- API routes -----

# 1) List all jobs (optional filter by job_type or location)
@app.route('/api/jobs', methods=['GET'])
def list_jobs():
    jobs = get_all_jobs()
    job_type = request.args.get('job_type')
    location = request.args.get('location')
    if job_type:
        jobs = [j for j in jobs if j.get('job_type') == job_type]
    if location:
        jobs = [j for j in jobs if location.lower() in (j.get('location') or '').lower()]
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
    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform(texts)
    idx = next(i for i, j in enumerate(jobs) if j['id'] == job_id)
    sims = cosine_similarity(matrix[idx:idx+1], matrix)[0]
    # sort by similarity (desc), skip self (idx)
    order = sims.argsort()[::-1]
    top = [jobs[i] for i in order if i != idx][:4]
    return jsonify(top)

# 4) Smart search (AI)
@app.route('/api/search', methods=['GET'])
def search():
    q = request.args.get('q', '').strip()
    jobs = get_all_jobs()
    if not q:
        return jsonify(jobs)

    texts = [job_to_text(j) for j in jobs]
    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform(texts)
    q_vec = vectorizer.transform([q])
    sims = cosine_similarity(q_vec, matrix)[0]
    order = sims.argsort()[::-1]
    results = [jobs[i] for i in order]
    return jsonify(results)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
```

4. Run the backend:
   ```bash
   python3 app.py
   ```
   You should see something like: `Running on http://127.0.0.1:5000`

5. Test in browser or another terminal:
   - Open: http://127.0.0.1:5000/api/jobs — you should see a JSON list of jobs.
   - Open: http://127.0.0.1:5000/api/search?q=python — you should see jobs ranked by relevance to "python".

Stop the server with `Ctrl+C` when done testing. We’ll start it again when we connect the frontend.

---

## Step 4 — Create React Frontend with Vite

**What we do:** Create the frontend project in a folder named `frontend` using Vite + React.

1. Open a **new** terminal (or go back to the project root). Go to your project folder:
   ```bash
   cd /Users/souravkumar/gourav-project
   ```

2. Create the React app (this creates a `frontend` folder):
   ```bash
   npm create vite@latest frontend -- --template react
   ```

3. Go into the frontend folder and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Install React Router (for switching between pages):
   ```bash
   npm install react-router-dom
   ```

5. Start the dev server to check it works:
   ```bash
   npm run dev
   ```
   Open the URL it shows (e.g. http://localhost:5173). You should see the default Vite + React page. Stop with `Ctrl+C`.

---

## Step 5 — Build the Frontend Pages

**What we do:** Replace the default Vite content with a simple Job Discovery UI: Home/Job list, Job detail (with Similar jobs), Search, and Shortlist. We’ll use a single `App.jsx` and simple components so a beginner can follow.

### 5.1 — Set up routing and API base URL

Edit **`frontend/src/App.jsx`** so the whole app uses React Router and one place for the API URL. Replace the entire file with:

**File: `frontend/src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Shortlist from './pages/Shortlist';

const API = 'http://localhost:5000/api';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
        <nav style={{ marginBottom: 20 }}>
          <a href="/" style={{ marginRight: 15 }}>Home</a>
          <a href="/shortlist">Shortlist</a>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/shortlist" element={<Shortlist />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
export { API };
```

We’ll use the `API` constant in the next files. Create the `pages` folder and three page components.

### 5.2 — Create the Home page (job list + search)

Create folder **`frontend/src/pages`** and file **`frontend/src/pages/Home.jsx`**:

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API + '/jobs')
      .then(res => res.json())
      .then(data => { setJobs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const doSearch = () => {
    if (!search.trim()) return;
    setLoading(true);
    fetch(API + '/search?q=' + encodeURIComponent(search))
      .then(res => res.json())
      .then(data => { setJobs(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  return (
    <div>
      <h1>Job Discovery</h1>
      <div style={{ marginBottom: 15 }}>
        <input
          type="text"
          placeholder="Search jobs (e.g. Python, React)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          style={{ padding: 8, width: 300, marginRight: 8 }}
        />
        <button onClick={doSearch}>Search</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {jobs.map(j => (
            <li key={j.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 8 }}>
              <Link to={'/job/' + j.id} style={{ fontWeight: 'bold' }}>{j.title}</Link>
              <div>{j.company} · {j.location} · {j.job_type}</div>
              <div style={{ fontSize: 14, color: '#666' }}>{j.skills}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 5.3 — Create the Job detail page (with Similar jobs and Shortlist button)

**File: `frontend/src/pages/JobDetail.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../App';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    fetch(API + '/jobs/' + id)
      .then(res => res.json())
      .then(data => setJob(data))
      .catch(console.error);
    fetch(API + '/jobs/' + id + '/similar')
      .then(res => res.json())
      .then(data => setSimilar(data))
      .catch(console.error);
  }, [id]);

  const addToShortlist = () => {
    const list = JSON.parse(localStorage.getItem('shortlist') || '[]');
    if (!list.find(j => j.id === job.id)) {
      list.push(job);
      localStorage.setItem('shortlist', JSON.stringify(list));
      alert('Added to shortlist!');
    }
  };

  if (!job) return <p>Loading...</p>;
  return (
    <div>
      <Link to="/">← Back to list</Link>
      <h1>{job.title}</h1>
      <p><strong>{job.company}</strong> · {job.location} · {job.job_type}</p>
      <p>{job.description}</p>
      <p><strong>Skills:</strong> {job.skills}</p>
      <button onClick={addToShortlist}>Add to shortlist</button>

      <h2>Similar jobs</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {similar.map(j => (
          <li key={j.id} style={{ border: '1px solid #eee', padding: 10, marginBottom: 8 }}>
            <Link to={'/job/' + j.id}>{j.title}</Link> — {j.company} · {j.job_type}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5.4 — Create the Shortlist page

**File: `frontend/src/pages/Shortlist.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Shortlist() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('shortlist') || '[]');
    setList(data);
  }, []);

  const remove = (id) => {
    const newList = list.filter(j => j.id !== id);
    setList(newList);
    localStorage.setItem('shortlist', JSON.stringify(newList));
  };

  return (
    <div>
      <h1>My shortlist</h1>
      {list.length === 0 ? (
        <p>No jobs in shortlist. <Link to="/">Browse jobs</Link></p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {list.map(j => (
            <li key={j.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 8 }}>
              <Link to={'/job/' + j.id}>{j.title}</Link> — {j.company}
              <button onClick={() => remove(j.id)} style={{ marginLeft: 10 }}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 5.5 — Clean up default files (optional)

- You can delete or simplify **`frontend/src/App.css`** if you don’t use it.
- In **`frontend/src/main.jsx`**, keep only the minimal setup; make sure it renders `<App />` (Vite template usually does).

Example **`frontend/src/main.jsx`**:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## Step 6 — Run Backend and Frontend Together

**What we do:** Start the backend first, then the frontend, and use the app end-to-end.

1. **Terminal 1 — Backend**
   ```bash
   cd /Users/souravkumar/gourav-project/backend
   source venv/bin/activate   # or on Windows: venv\Scripts\activate
   python3 app.py
   ```
   Leave it running. You should see: `Running on http://127.0.0.1:5000`

2. **Terminal 2 — Frontend**
   ```bash
   cd /Users/souravkumar/gourav-project/frontend
   npm run dev
   ```
   Open the URL it shows (e.g. http://localhost:5173).

3. **Test:**
   - On Home you should see the list of jobs from SQLite.
   - Use the search box (e.g. "Python") and click Search — list should update with AI-ranked results.
   - Click a job → Job detail page with "Similar jobs" at the bottom.
   - Click "Add to shortlist" → go to Shortlist page and see the job there. Remove works too.

---

## Step 7 — Add More Sample Jobs (Optional)

To have 30–50 jobs for a better demo:

1. Open **`backend/seed_db.py`**.
2. Add more tuples to the `jobs` list in the same format:
   `(title, company, location, job_type, description, skills)`.
3. To avoid duplicate rows, you can clear the table first. In `seed_db.py`, before the `for j in jobs:` loop, add:
   ```python
   c.execute("DELETE FROM jobs")
   ```
4. Run again:
   ```bash
   cd backend
   python3 seed_db.py
   ```
   Restart the Flask server so it loads the new data.

---

## Quick Checklist (Beginner)

- [ ] Node.js and Python installed and working in terminal.
- [ ] `backend` folder with `venv`, Flask, flask-cors, scikit-learn installed.
- [ ] `jobs.db` created with `seed_db.py` and at least a few jobs.
- [ ] `app.py` runs and http://localhost:5000/api/jobs returns JSON.
- [ ] `frontend` folder created with `npm create vite`, dependencies and react-router-dom installed.
- [ ] `App.jsx` and the three pages (Home, JobDetail, Shortlist) created under `src/pages`.
- [ ] Backend running on port 5000, frontend on 5173; browse, search, similar jobs, and shortlist all work.

---

## If Something Goes Wrong

- **"Cannot GET /api/jobs"** — Backend is not running or not on port 5000. Start it from `backend` with `python3 app.py`.
- **Blank page or network error in browser** — Frontend is calling `http://localhost:5000`. Ensure Flask is running and CORS is enabled (`flask_cors` is in `app.py`).
- **Search or similar jobs not changing** — Hard-refresh the page (Ctrl+Shift+R or Cmd+Shift+R). Check browser DevTools → Network to see if the request goes to the right URL.
- **Port already in use** — Either stop the other program using that port or change the port in `app.py` (e.g. `app.run(port=5001)`) and in the frontend change `API` to `http://localhost:5001/api`.

Once this works, you can slowly add filters (e.g. by `job_type` or `location` on the Home page) and improve the styling. Good luck.
