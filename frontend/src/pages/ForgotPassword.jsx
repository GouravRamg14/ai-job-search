import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../api';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { setTokenFromOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const emailNorm = email.trim().toLowerCase();
    const pw = password.trim();
    const cf = confirm.trim();
    if (pw !== cf) {
      setErr('Passwords do not match.');
      return;
    }
    if (pw.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API}/auth/reset-password-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: emailNorm, new_password: pw }),
      });
      let data = {};
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        if (!res.ok) {
          throw new Error(text?.slice(0, 200) || 'Invalid response from server');
        }
      }
      if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed (${res.status})`);
      }
      if (data.updated && data.token) {
        setTokenFromOAuth(data.token, data.user);
        navigate('/', { replace: true });
        return;
      }
      setDone(true);
      const ok = Boolean(data.updated);
      setSuccess(ok);
      setStatusMessage(typeof data.message === 'string' ? data.message : '');
    } catch (e2) {
      setErr(e2.message || 'Something went wrong. Is the backend running on port 5000?');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Enter the email on your account and choose a new password. No email is sent—this flow is for demos only and is not secure for production."
      footer={
        <>
          Remember your password?{' '}
          <Link to="/login" className="text-slate-400 underline underline-offset-2 hover:text-slate-300">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-white">Forgot password</h2>
        <p className="mt-1 text-sm text-slate-400">
          For email/password accounts only. If you use Google sign-in, reset isn&apos;t available here.
        </p>
      </div>

      {done ? (
        <div className="space-y-4">
          {success ? (
            <>
              <div
                role="status"
                className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100"
              >
                Password updated. You can sign in with your new password.
              </div>
              <button
                type="button"
                onClick={() => navigate('/login?reset=success', { replace: true })}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
              >
                Go to sign in
              </button>
            </>
          ) : (
            <>
              <div
                role="status"
                className="rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
              >
                {statusMessage ||
                  'No password-based account was found for that email. Register first, or use Google sign-in if you already did.'}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/register"
                  className="flex flex-1 items-center justify-center rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="flex flex-1 items-center justify-center rounded-xl border border-white/10 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      ) : (
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
            <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="forgot-new" className="mb-1.5 block text-sm font-medium text-slate-300">
              New password
            </label>
            <div className="relative">
              <input
                id="forgot-new"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 py-3 pl-4 pr-14 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                placeholder="At least 8 characters"
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
          <div>
            <label htmlFor="forgot-confirm" className="mb-1.5 block text-sm font-medium text-slate-300">
              Confirm new password
            </label>
            <input
              id="forgot-confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              placeholder="Repeat password"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Updating…
              </>
            ) : (
              'Update password'
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
