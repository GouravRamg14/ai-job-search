import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Shortlist from './pages/Shortlist';
import AppliedJobs from './pages/AppliedJobs';
import CompanyJobs from './pages/CompanyJobs';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ConfirmModal from './components/ui/ConfirmModal';
import RequireAuth from './components/auth/RequireAuth';

function userInitials(user) {
  if (user.display_name) {
    const parts = user.display_name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (user.email || '??').slice(0, 2).toUpperCase();
}

function HeaderNav() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const authShell = ['/login', '/register', '/auth/callback', '/forgot-password'].includes(location.pathname);

  if (authShell) {
    return (
      <header className="mb-8 flex items-center justify-between gap-4">
        <NavLink to="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-400 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition group-hover:scale-[1.02]">
            JD
          </span>
          <div>
            <div className="text-sm font-semibold tracking-tight text-white">Job Discovery</div>
            <div className="text-xs text-slate-500">Back to home</div>
          </div>
        </NavLink>
        <NavLink
          to="/"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
        >
          ← Home
        </NavLink>
      </header>
    );
  }

  const navLinkClass = (isActive) =>
    [
      'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:inline-block lg:py-2',
      isActive ? 'bg-slate-800 text-white shadow-sm lg:bg-slate-800' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white lg:text-slate-400 lg:hover:bg-transparent lg:hover:text-white',
    ].join(' ');

  const navLinkClassActiveBrand = (isActive) =>
    [
      'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:inline-block lg:py-2',
      isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white lg:text-slate-400 lg:hover:bg-transparent lg:hover:text-white',
    ].join(' ');

  return (
    <>
      <header className="mb-6 rounded-2xl border border-white/[0.08] bg-slate-900/50 shadow-soft backdrop-blur-md md:mb-8 lg:px-6 lg:py-3">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-0 lg:py-0">
          <NavLink to="/" className="group flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3" onClick={() => setMobileNavOpen(false)}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-400 text-xs font-bold text-white shadow-lg shadow-brand-500/15 transition group-hover:scale-[1.02] sm:h-10 sm:w-10 sm:text-sm">
              JD
            </div>
            <div className="min-w-0 text-left">
              <div className="truncate text-[0.65rem] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.16em]">
                Job Discovery Studio
              </div>
              <p className="truncate text-[0.7rem] text-slate-500 sm:text-xs">AI-powered job explorer</p>
            </div>
          </NavLink>

          {/* Desktop / large tablet: inline nav + auth */}
          <div className="hidden items-center gap-2 lg:flex lg:gap-3">
            <nav className="flex items-center gap-1 rounded-xl bg-slate-950/50 p-1">
              <NavLink to="/" className={({ isActive }) => navLinkClass(isActive)}>
                Home
              </NavLink>
              <NavLink to="/shortlist" className={({ isActive }) => navLinkClassActiveBrand(isActive)}>
                Shortlist
              </NavLink>
              <NavLink to="/applications" className={({ isActive }) => navLinkClassActiveBrand(isActive)}>
                Applications
              </NavLink>
            </nav>

            <div className="h-8 w-px bg-white/[0.08]" />

            {loading ? (
              <div className="flex h-10 items-center px-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400" />
              </div>
            ) : user ? (
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-white/[0.1] bg-slate-950/60 py-1.5 pl-1.5 pr-3 text-sm font-medium text-slate-200 transition hover:border-white/[0.15] hover:bg-slate-900 [&::-webkit-details-marker]:hidden">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-xs font-bold text-white">
                    {userInitials(user)}
                  </span>
                  <span className="hidden max-w-[10rem] truncate xl:inline">{user.display_name || user.email}</span>
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/[0.1] bg-slate-900 py-1 shadow-2xl shadow-black/40">
                  <div className="border-b border-white/[0.06] px-4 py-3">
                    <p className="text-[0.65rem] font-medium uppercase tracking-wider text-slate-500">Signed in as</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-white">{user.email}</p>
                  </div>
                  <NavLink
                    to="/profile"
                    className="block px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    onClick={(e) => {
                      const el = e.currentTarget.closest('details');
                      if (el) el.open = false;
                    }}
                  >
                    Profile & account
                  </NavLink>
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-sm text-red-300 transition hover:bg-red-950/40"
                    onClick={() => {
                      setSignOutOpen(true);
                      const d = document.querySelector('details[open]');
                      if (d) d.open = false;
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </details>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    [
                      'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white',
                    ].join(' ')
                  }
                >
                  Sign in
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile / small tablet: menu toggle */}
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 text-slate-200 transition hover:border-white/20 hover:bg-slate-900 lg:hidden"
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            {mobileNavOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        <div
          className={[
            'border-t border-white/[0.08] bg-slate-950/40 px-4 pb-4 pt-2 lg:hidden',
            mobileNavOpen ? 'block' : 'hidden',
          ].join(' ')}
        >
          <nav className="flex flex-col gap-0.5 rounded-xl bg-slate-950/60 p-1.5">
            <NavLink to="/" className={({ isActive }) => navLinkClass(isActive)} onClick={() => setMobileNavOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/shortlist" className={({ isActive }) => navLinkClassActiveBrand(isActive)} onClick={() => setMobileNavOpen(false)}>
              Shortlist
            </NavLink>
            <NavLink to="/applications" className={({ isActive }) => navLinkClassActiveBrand(isActive)} onClick={() => setMobileNavOpen(false)}>
              Applications
            </NavLink>
          </nav>

          <div className="mt-4 border-t border-white/[0.06] pt-4">
            {loading ? (
              <div className="flex justify-center py-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400" />
              </div>
            ) : user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-slate-900/80 px-3 py-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-xs font-bold text-white">
                    {userInitials(user)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.65rem] font-medium uppercase tracking-wider text-slate-500">Signed in</p>
                    <p className="truncate text-sm font-medium text-white">{user.email}</p>
                  </div>
                </div>
                <NavLink
                  to="/profile"
                  className="block rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Profile & account
                </NavLink>
                <button
                  type="button"
                  className="w-full rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-950/50"
                  onClick={() => {
                    setMobileNavOpen(false);
                    setSignOutOpen(true);
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-stretch">
                <NavLink
                  to="/login"
                  className="flex flex-1 items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Sign in
                </NavLink>
                <NavLink
                  to="/register"
                  className="flex flex-1 items-center justify-center rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/15 transition hover:bg-brand-600"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmModal
        open={signOutOpen}
        title="Sign out?"
        description="You’ll need to sign in again to access your shortlist, applications, and profile on this device."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        danger
        onConfirm={() => {
          logout();
          setSignOutOpen(false);
          navigate('/');
        }}
        onCancel={() => setSignOutOpen(false)}
      />
    </>
  );
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[42rem] w-[42rem] rounded-full bg-brand-600/12 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[36rem] w-[36rem] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 md:px-8 md:pt-10">
        <HeaderNav />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/company/:companyName" element={<CompanyJobs />} />
            <Route
              path="/shortlist"
              element={
                <RequireAuth>
                  <Shortlist />
                </RequireAuth>
              }
            />
            <Route
              path="/applications"
              element={
                <RequireAuth>
                  <AppliedJobs />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-slate-600">
          <span>Job Discovery Studio</span>
          <span className="hidden sm:inline">AI search · Shortlist · Applications · Account</span>
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
