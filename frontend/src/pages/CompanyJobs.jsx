import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../api';
import { getJobImageUrl } from '../utils/jobImage';
import { relativeTime } from '../utils/relativeTime';

export default function CompanyJobs() {
  const { companyName } = useParams();
  const decoded = decodeURIComponent(companyName || '');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!decoded) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(API + '/jobs?company=' + encodeURIComponent(decoded))
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [decoded]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-brand-200"
        >
          <span className="text-sm">←</span>
          <span>Back to search</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-soft backdrop-blur-md">
        <h1 className="text-xl font-semibold text-slate-50 md:text-2xl">
          Jobs at {decoded}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {loading ? 'Loading…' : `${jobs.length} open role${jobs.length === 1 ? '' : 's'}`}
        </p>

        {loading ? (
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
            <span>Loading roles…</span>
          </div>
        ) : jobs.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">No open roles found for this company.</p>
        ) : (
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {jobs.map(j => (
              <li
                key={j.id}
                className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500/70 hover:bg-slate-900 hover:shadow-soft"
              >
                <div className="flex gap-4">
                  <img
                    src={getJobImageUrl(j)}
                    alt=""
                    className="h-14 w-14 flex-shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Link
                      to={'/job/' + j.id}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-50 transition group-hover:text-brand-200 md:text-base"
                    >
                      {j.title}
                      <span className="text-[0.6rem] uppercase tracking-[0.18em] text-brand-200/80">View</span>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span>{j.location}</span>
                      <span>·</span>
                      <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[0.7rem] uppercase tracking-[0.16em] text-slate-300">
                        {j.job_type}
                      </span>
                      {j.posted_at && (
                        <>
                          <span>·</span>
                          <span className="text-slate-500">{relativeTime(j.posted_at)}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[0.65rem] text-slate-400">
                      {j.salary && <span>{j.salary}</span>}
                      {j.experience_level && <span className="rounded bg-slate-800/80 px-1.5 py-0.5">{j.experience_level}</span>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
