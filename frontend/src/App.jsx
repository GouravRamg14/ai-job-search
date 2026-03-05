import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Shortlist from './pages/Shortlist';
import CompanyJobs from './pages/CompanyJobs';

const API = 'http://localhost:5000/api';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 md:px-8 md:pt-10">
          <header className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 shadow-soft backdrop-blur-md md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-400 shadow-soft">
                <span className="text-lg font-semibold text-white">JD</span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                  <span className="h-px w-4 rounded bg-slate-500" />
                  Job Discovery Studio
                </div>
                <p className="text-xs text-slate-400">
                  AI-powered early career job explorer
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-2 text-sm font-medium">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  [
                    'rounded-xl px-3 py-1.5 transition-colors',
                    isActive
                      ? 'bg-slate-800 text-slate-50 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
                  ].join(' ')
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/shortlist"
                className={({ isActive }) =>
                  [
                    'rounded-xl px-3 py-1.5 transition-colors',
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-brand-500/80 hover:text-white',
                  ].join(' ')
                }
              >
                Shortlist
              </NavLink>
            </nav>
          </header>

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/company/:companyName" element={<CompanyJobs />} />
              <Route path="/shortlist" element={<Shortlist />} />
            </Routes>
          </main>

          <footer className="mt-8 flex items-center justify-between text-xs text-slate-500">
            <span>Built for demo & presentations</span>
            <span className="hidden gap-2 md:flex">
              <span className="h-px w-4 rounded bg-slate-600" />
              <span>Job Discovery • AI search • Shortlist</span>
            </span>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
export { API };
