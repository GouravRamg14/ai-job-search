import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenFromOAuth } = useAuth();
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Something went wrong.');
      const t = setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 1200);
      return () => clearTimeout(t);
    }
    setTokenFromOAuth(token);
    navigate('/', { replace: true });
  }, [searchParams, navigate, setTokenFromOAuth]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 shadow-soft">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400" />
      </div>
      <h1 className="text-lg font-semibold text-white">{message}</h1>
      <p className="mt-2 text-sm text-slate-500">Securing your session…</p>
      <Link to="/login" className="mt-8 text-sm text-brand-400 hover:text-brand-300">
        Cancel and return to sign in
      </Link>
    </div>
  );
}
