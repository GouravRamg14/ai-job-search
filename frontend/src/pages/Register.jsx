import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import { getSafeNextPath } from '../utils/authRedirect';

function FieldIcon({ children }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 [&>svg]:h-[18px] [&>svg]:w-[18px]">
      {children}
    </span>
  );
}

function passwordStrengthScore(pw) {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(s, 4);
}

export default function Register() {
  const { register, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const strength = useMemo(() => passwordStrengthScore(password), [password]);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength] || '';

  useEffect(() => {
    if (!authLoading && user) navigate(getSafeNextPath(params), { replace: true });
  }, [user, authLoading, navigate, params]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!acceptedTerms) {
      setErr('Please accept the terms to continue.');
      return;
    }
    setBusy(true);
    try {
      await register({ email, password, display_name: displayName || undefined });
      navigate(getSafeNextPath(params), { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Could not register');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Job Discovery to search smarter, shortlist roles, and manage your profile in one place."
      footer={
        <>
          By registering you agree to our terms of use. Questions? Return to{' '}
          <Link to="/" className="text-slate-400 underline underline-offset-2 hover:text-slate-300">
            home
          </Link>
          .
        </>
      }
    >
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-white">Register</h2>
        <p className="mt-1 text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            to={
              params.get('next') ? `/login?next=${encodeURIComponent(params.get('next'))}` : '/login'
            }
            className="font-medium text-brand-400 hover:text-brand-300"
          >
            Sign in
          </Link>
        </p>
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
          <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-slate-300">
            Display name <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <div className="relative">
            <FieldIcon>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </FieldIcon>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              placeholder="Alex Kumar"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Work email
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
              id="reg-email"
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
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-slate-300">
            Password
          </label>
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
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 py-3 pl-11 pr-14 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              placeholder="Minimum 8 characters"
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
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  strength <= 1
                    ? 'w-[25%] bg-amber-600'
                    : strength === 2
                      ? 'w-[50%] bg-amber-400'
                      : strength === 3
                        ? 'w-[75%] bg-emerald-500'
                        : password
                          ? 'w-full bg-emerald-400'
                          : 'w-0'
                }`}
              />
            </div>
            <span className="min-w-[3.5rem] text-right text-xs tabular-nums text-slate-500">
              {password ? strengthLabel : '—'}
            </span>
          </div>
        </div>

        <label className="flex cursor-pointer gap-3 rounded-xl border border-white/[0.06] bg-slate-950/30 p-4">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500/40"
          />
          <span className="text-sm leading-snug text-slate-400">
            I agree to the{' '}
            <span className="text-slate-300">Terms of Service</span> and{' '}
            <span className="text-slate-300">Privacy Policy</span>.
          </span>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
