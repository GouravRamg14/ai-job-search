// In dev, use relative /api (Vite proxies to backend). Set VITE_API_URL for production if needed.
const base = (import.meta.env.VITE_API_URL ?? '').toString().replace(/\/?$/, '');
export const API = base ? `${base}/api` : '/api';
