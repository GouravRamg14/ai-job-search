import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ui/ConfirmModal';

function initialsFromUser(user) {
  if (user.display_name) {
    const parts = user.display_name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    return parts[0].slice(0, 2).toUpperCase();
  }
  const e = user.email || '';
  return e.slice(0, 2).toUpperCase();
}

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const initials = useMemo(() => (user ? initialsFromUser(user) : ''), [user]);

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400" />
        <p className="text-sm text-slate-500">Loading your profile…</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-3xl space-y-8">
        {/* Cover + identity */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-900/40 shadow-soft">
          <div className="h-28 bg-gradient-to-r from-brand-600/80 via-indigo-600/60 to-slate-900 sm:h-32" />
          <div className="relative px-6 pb-8 pt-0 sm:px-10">
            <div className="-mt-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                <div
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border-4 border-slate-950 bg-gradient-to-br from-brand-500 to-indigo-600 text-2xl font-bold tracking-tight text-white shadow-xl shadow-brand-500/20"
                  aria-hidden
                >
                  {initials}
                </div>
                <div className="min-w-0 pb-1">
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {user.display_name || 'Your profile'}
                  </h1>
                  <p className="mt-1 truncate text-sm text-slate-400">{user.email}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    Active session
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:pb-2">
                <Link
                  to="/"
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5"
                >
                  Browse jobs
                </Link>
                <button
                  type="button"
                  onClick={() => setSignOutOpen(true)}
                  className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-950/50"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="rounded-2xl border border-white/[0.08] bg-slate-900/35 p-6 lg:col-span-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Account</h2>
            <dl className="mt-6 space-y-5">
              <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-5 sm:flex-row sm:justify-between">
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="text-sm font-medium text-slate-100">{user.email}</dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-5 sm:flex-row sm:justify-between">
                <dt className="text-sm text-slate-500">Display name</dt>
                <dd className="text-sm font-medium text-slate-100">{user.display_name || '—'}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <dt className="text-sm text-slate-500">User ID</dt>
                <dd className="font-mono text-sm text-slate-400">{user.id}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-slate-900/35 p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Security</h2>
            <ul className="mt-6 space-y-3 text-sm text-slate-400">
              <li className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-slate-950/40 px-4 py-3">
                <span>Password</span>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-400 transition hover:text-brand-300"
                >
                  Set new password
                </Link>
              </li>
              <li className="rounded-xl border border-white/[0.06] bg-slate-950/40 px-4 py-3 text-xs leading-relaxed text-slate-500">
                Sessions use signed tokens. Sign out on shared devices when you&apos;re done.
              </li>
            </ul>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={signOutOpen}
        title="Sign out?"
        description="You’ll need to sign in again to access your shortlist and saved preferences on this device."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        danger
        onConfirm={() => {
          logout();
          setSignOutOpen(false);
          navigate('/', { replace: true });
        }}
        onCancel={() => setSignOutOpen(false)}
      />
    </>
  );
}
