import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenFromOAuth } = useAuth();
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Missing token. Redirecting…');
      const t = setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 800);
      return () => clearTimeout(t);
    }
    setTokenFromOAuth(token);
    navigate('/', { replace: true });
  }, [searchParams, navigate, setTokenFromOAuth]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-300">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-hidden />
      <p className="text-sm">{message}</p>
    </div>
  );
}
