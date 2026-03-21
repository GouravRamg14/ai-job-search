import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API } from '../api';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';

function FieldIcon({ children }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 [&>svg]:h-[18px] [&>svg]:w-[18px]">
      {children}
    </span>
  );
}

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    fetch(`${API}/auth/config`)
      .then((r) => r.json())
      .then((d) => setGoogleEnabled(Boolean(d.google_enabled)))
      .catch(() => setGoogleEnabled(false));
  }, []);

  useEffect(() => {
    const oauthErr = params.get('error');
    if (oauthErr === 'oauth_failed') setErr('Google sign-in failed. Try again or use email.');
    if (oauthErr === 'oauth_incomplete') setErr('Google did not return email. Check your Google account.');
  }, [params]);

  useEffect(() => {
    if (!authLoading && user) navigate('/', { replace: true });
  }, [user, authLoading, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to save shortlists, sync preferences, and pick up where you left off."
      footer={
        <>
          Protected by industry-standard password hashing. See our{' '}
          <Link to="/" className="text-slate-400 underline underline-offset-2 hover:text-slate-300">
            home
          </Link>{' '}
          for product info.
        </>
      }
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">Sign in</h2>
          <p className="mt-1 text-sm text-slate-400">
            New to Job Discovery?{' '}
            <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {err ? (
          <div
            role="alert"
            className="rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100"
          >
            {err}
          </div>
        ) : null}

        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Email
          </label>
          <div className="relative">
            <FieldIcon>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </FieldIcon>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label htmlFor="login-password" className="text-sm font-medium text-slate-300">
              Password
            </label>
            <span
              className="cursor-not-allowed text-xs text-slate-500"
              title="Password reset is not enabled in this demo"
            >
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <FieldIcon>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </FieldIcon>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 py-3 pl-11 pr-12 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              placeholder="••••••••"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>

        {googleEnabled ? (
          <>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
                <span className="bg-slate-950/80 px-3 text-slate-500">or</span>
              </div>
            </div>
            <a
              href={`${API}/auth/google`}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.03] py-3 text-sm font-medium text-slate-100 shadow-sm transition hover:bg-white/[0.06]"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>
          </>
        ) : (
          <p className="rounded-xl border border-white/[0.06] bg-slate-950/40 px-4 py-3 text-center text-xs leading-relaxed text-slate-500">
            Google sign-in appears when the API has{' '}
            <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[0.7rem] text-slate-400">GOOGLE_CLIENT_ID</code> configured.
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
