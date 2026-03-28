import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { API } from '../api';

export const TOKEN_KEY = 'jd_auth_token';

const AuthContext = createContext(null);

function cleanToken(t) {
  if (t == null) return null;
  const s = String(t).trim();
  return s || null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => cleanToken(localStorage.getItem(TOKEN_KEY)));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(cleanToken(localStorage.getItem(TOKEN_KEY))));
  /** After login/register/OAuth, ignore one spurious 401 from /me (race or whitespace token issues). */
  const freshCredentialsSessionRef = useRef(false);

  const persistToken = useCallback((t) => {
    const c = cleanToken(t);
    if (c) {
      localStorage.setItem(TOKEN_KEY, c);
      setToken(c);
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
    const authHeader = `Bearer ${token}`;
    fetch(`${API}/auth/me`, {
      headers: { Authorization: authHeader },
    })
      .then(async (res) => {
        if (res.status === 401) {
          if (!cancelled) {
            if (freshCredentialsSessionRef.current) {
              freshCredentialsSessionRef.current = false;
              return;
            }
            persistToken(null);
          }
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.user) {
          freshCredentialsSessionRef.current = false;
          setUser(data.user);
        }
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
      const emailNorm = email.trim().toLowerCase();
      const pwd =
        typeof password === 'string' ? password.trim() : String(password ?? '');
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailNorm, password: pwd }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Login failed');
      const t = cleanToken(data.token);
      if (!t) throw new Error('Login did not return a token');
      freshCredentialsSessionRef.current = true;
      persistToken(t);
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
      const t = cleanToken(data.token);
      if (!t) throw new Error('Registration did not return a token');
      freshCredentialsSessionRef.current = true;
      persistToken(t);
      setUser(data.user);
      return data.user;
    },
    [persistToken],
  );

  const logout = useCallback(() => {
    persistToken(null);
  }, [persistToken]);

  /** Second arg optional: set user immediately (OAuth passes token only; /me fills user). */
  const setTokenFromOAuth = useCallback(
    (t, userFromServer) => {
      if (!t) {
        persistToken(null);
        return;
      }
      const c = cleanToken(t);
      if (!c) return;
      freshCredentialsSessionRef.current = true;
      persistToken(c);
      if (userFromServer) setUser(userFromServer);
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
