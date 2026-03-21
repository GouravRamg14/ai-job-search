import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Signed in account details</p>
      </div>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-soft backdrop-blur-md">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Email</div>
          <div className="mt-1 text-slate-100">{user.email}</div>
        </div>
        {user.display_name ? (
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Display name</div>
            <div className="mt-1 text-slate-100">{user.display_name}</div>
          </div>
        ) : null}
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">User ID</div>
          <div className="mt-1 font-mono text-sm text-slate-400">{user.id}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/', { replace: true });
          }}
          className="w-full rounded-xl border border-white/15 bg-slate-950/40 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
