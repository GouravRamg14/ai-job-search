/** Safe in-app path for post-login redirect (open redirect guard). */
export function getSafeNextPath(searchParams) {
  const next = searchParams.get('next');
  if (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }
  return '/';
}

export function loginUrlWithNext(pathname, search = '') {
  const full = pathname + search;
  return `/login?next=${encodeURIComponent(full)}`;
}
