import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API } from '../api';

export const TOKEN_KEY = 'jd_auth_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persistToken = useCallback((t) => {
    if (t) {
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          if (!cancelled) persistToken(null);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.user) setUser(data.user);
      })
      .catch(() => {
        // Network error: keep token; user may still be set from login/register.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, persistToken]);

  const login = useCallback(
    async (email, password) => {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Login failed');
      persistToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [persistToken],
  );

  const register = useCallback(
    async ({ email, password, display_name }) => {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      persistToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [persistToken],
  );

  const logout = useCallback(() => {
    persistToken(null);
  }, [persistToken]);

  const setTokenFromOAuth = useCallback(
    (t) => {
      persistToken(t);
    },
    [persistToken],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      setTokenFromOAuth,
    }),
    [user, token, loading, login, register, logout, setTokenFromOAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
