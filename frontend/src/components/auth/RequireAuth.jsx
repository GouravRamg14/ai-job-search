import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = location.pathname + location.search;
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
    }
  }, [user, loading, navigate, location.pathname, location.search]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400" />
        <p className="text-sm text-slate-500">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-slate-500">Redirecting to sign in…</p>
      </div>
    );
  }

  return children;
}
