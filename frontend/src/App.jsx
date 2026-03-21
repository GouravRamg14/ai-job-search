import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Shortlist from './pages/Shortlist';
import CompanyJobs from './pages/CompanyJobs';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Profile from './pages/Profile';

function HeaderNav() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 shadow-soft backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-400 shadow-soft">
          <span className="text-lg font-semibold text-white">JD</span>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            <span className="h-px w-4 rounded bg-slate-500" />
            Job Discovery Studio
          </div>
          <p className="text-xs text-slate-400">AI-powered early career job explorer</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
        <nav className="flex items-center gap-2">
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

        <div className="hidden h-6 w-px bg-slate-700 sm:block" />

        {loading ? (
          <span className="text-xs text-slate-500">…</span>
        ) : user ? (
          <div className="flex flex-wrap items-center gap-2">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                [
                  'rounded-xl px-3 py-1.5 text-xs transition-colors',
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
                ].join(' ')
              }
            >
              Profile
            </NavLink>
            <span className="hidden max-w-[8rem] truncate text-xs text-slate-500 sm:inline md:max-w-[14rem]" title={user.email}>
              {user.display_name || user.email}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                [
                  'rounded-xl px-3 py-1.5 transition-colors',
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
                ].join(' ')
              }
            >
              Sign in
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-xl bg-brand-500/90 px-3 py-1.5 text-white shadow-sm transition hover:bg-brand-600"
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 md:px-8 md:pt-10">
        <HeaderNav />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/company/:companyName" element={<CompanyJobs />} />
            <Route path="/shortlist" element={<Shortlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<Profile />} />
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
export { API } from './api';
