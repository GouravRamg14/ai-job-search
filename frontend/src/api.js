// In dev, use relative /api (Vite proxies to backend). Set VITE_API_URL for production if needed.
// If VITE_API_URL already ends with /api (e.g. http://host:5000/api), do not append /api again.
const raw = (import.meta.env.VITE_API_URL ?? '').toString().trim();
export const API = (() => {
  if (!raw) return '/api';
  const b = raw.replace(/\/?$/, '');
  if (b.endsWith('/api')) return b;
  return `${b}/api`;
})();
