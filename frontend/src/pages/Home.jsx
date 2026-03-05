import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [emptyState, setEmptyState] = useState(false);

  useEffect(() => {
    fetch(API + '/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setEmptyState(data.length === 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const doSearch = () => {
    if (!search.trim()) return;
    setLoading(true);
    fetch(API + '/search?q=' + encodeURIComponent(search))
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setEmptyState(data.length === 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-[2fr,1.4fr]">
        <div className="space-y-4">
          <h1 className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
            Discover beginner‑friendly tech roles, fast.
          </h1>
          <p className="max-w-xl text-sm text-slate-300 md:text-base">
            Type how you would talk:{" "}
            <span className="font-medium text-slate-100">
              “I&apos;m looking for Java backend in Bangalore”
            </span>
            . We&apos;ll rank roles using AI similarity and show you the best matches first.
          </p>

          <div className="relative mt-4">
            <div className="pointer-events-none absolute inset-0 -translate-y-4 scale-105 bg-gradient-to-r from-brand-500/35 via-cyan-400/20 to-purple-500/25 blur-3xl opacity-60" />
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 shadow-soft backdrop-blur-md md:px-4 md:py-3">
              <div className="hidden rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-300/90 md:block">
                Smart Search
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full border-none bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-0 md:text-base"
                  placeholder='Try: "entry level python backend remote"'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                />
              </div>
              <button
                type="button"
                onClick={doSearch}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98] md:px-4 md:py-2 md:text-sm"
              >
                <span>Search roles</span>
                <span className="hidden text-[0.65rem] text-brand-100/90 md:inline">
                  ⌘ + Enter
                </span>
              </button>
            </div>
          </div>

          <p className="flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex h-6 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-emerald-200">
              Typo‑tolerant AI search
            </span>
            <span>Powered by similarity search over titles, descriptions &amp; skills.</span>
          </p>
        </div>

        <div className="relative hidden md:block">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.28),transparent_55%),radial-gradient(circle_at_bottom,_rgba(8,47,73,0.6),transparent_55%)] opacity-90" />
          <div className="relative flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-5 py-6 shadow-soft">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Live Snapshot
              </p>
              <p className="text-lg font-semibold text-slate-50">
                {loading ? 'Scanning roles…' : `${jobs.length} matches loaded`}
              </p>
              <p className="text-xs text-slate-400">
                Your query is ranked against a curated set of beginner‑friendly roles.
              </p>
            </div>
            <div className="mt-6 space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-3 py-2">
                <span className="font-medium text-slate-200">Instant shortlist</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-300">
                  Click into a role → Add
                </span>
              </div>
              <p className="text-[0.7rem] text-slate-400">
                Use the shortlist tab to save interesting roles during your live demo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-soft backdrop-blur-md md:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-50 md:text-base">
              Matching roles
            </h2>
            <p className="text-xs text-slate-400">
              Sorted by how well they fit what you typed.
            </p>
          </div>
          {!loading && (
            <span className="rounded-full bg-slate-900 px-3 py-1 text-[0.7rem] text-slate-300">
              {jobs.length} result{jobs.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
            <span>Finding roles that best match your query…</span>
          </div>
        ) : emptyState ? (
          <div className="space-y-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/80 px-4 py-6 text-sm text-slate-300">
            <p className="font-medium text-slate-100">
              No roles matched that query just yet.
            </p>
            <p className="text-xs text-slate-400">
              Try searching by{" "}
              <span className="font-medium text-slate-200">skill</span> (e.g.{" "}
              <span className="font-mono text-emerald-300">"python backend"</span>),{" "}
              <span className="font-medium text-slate-200">location</span> (e.g.{" "}
              <span className="font-mono text-emerald-300">"remote"</span>) or{" "}
              <span className="font-medium text-slate-200">experience</span> (e.g.{" "}
              <span className="font-mono text-emerald-300">"internship"</span>).
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {jobs.map(j => (
              <li
                key={j.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500/70 hover:bg-slate-900 hover:shadow-soft"
              >
                <div className="space-y-1.5">
                  <Link
                    to={'/job/' + j.id}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-50 transition group-hover:text-brand-200 md:text-base"
                  >
                    {j.title}
                    <span className="text-[0.6rem] uppercase tracking-[0.18em] text-brand-200/80">
                      View
                    </span>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5">
                      {j.company}
                    </span>
                    <span>·</span>
                    <span className="text-slate-300">{j.location}</span>
                    <span>·</span>
                    <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[0.7rem] uppercase tracking-[0.16em] text-slate-300">
                      {j.job_type}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-400">
                    {j.description}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {String(j.skills || '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
                    .slice(0, 4)
                    .map(skill => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.65rem] text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
