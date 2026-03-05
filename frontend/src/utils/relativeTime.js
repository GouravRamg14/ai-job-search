/**
 * Returns relative time string from an ISO date (e.g. "2 days ago", "1 week ago").
 */
export function relativeTime(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const sec = Math.floor((now - date) / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const week = Math.floor(day / 7);

  if (sec < 60) return 'Just now';
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  if (week < 4) return `${week} week${week === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}
