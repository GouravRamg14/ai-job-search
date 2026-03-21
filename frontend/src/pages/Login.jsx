import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Sign in</h1>
        <p className="mt-1 text-sm text-slate-400">
          Use your email or Google. New here?{' '}
          <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300">
            Create an account
          </Link>
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-soft backdrop-blur-md">
        {err ? (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">{err}</div>
        ) : null}
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="you@example.com"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        {googleEnabled ? (
          <>
            <div className="relative py-2 text-center text-xs text-slate-500 before:absolute before:left-0 before:right-0 before:top-1/2 before:z-0 before:h-px before:bg-slate-700">
              <span className="relative z-10 bg-slate-900/60 px-2">or</span>
            </div>
            <a
              href={`${API}/auth/google`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-950/40 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-800/80"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>
          </>
        ) : (
          <p className="text-center text-xs text-slate-500">
            Google sign-in is disabled until the server sets <code className="text-slate-400">GOOGLE_CLIENT_ID</code> and{' '}
            <code className="text-slate-400">GOOGLE_CLIENT_SECRET</code>.
          </p>
        )}
      </form>
    </div>
  );
}
