import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobImageUrl } from '../utils/jobImage';
import { relativeTime } from '../utils/relativeTime';

export default function Shortlist() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('shortlist') || '[]');
    setList(data);
  }, []);

  const remove = (id) => {
    const newList = list.filter(j => j.id !== id);
    setList(newList);
    localStorage.setItem('shortlist', JSON.stringify(newList));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50 md:text-2xl">
            Shortlisted roles
          </h1>
          <p className="text-xs text-slate-400 md:text-sm">
            Save roles during a live search, then come back here to compare.
          </p>
        </div>
        <Link
          to="/"
          className="hidden text-xs font-medium text-brand-200 underline-offset-2 hover:underline md:inline"
        >
          ← Continue exploring roles
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-5 py-6 text-sm text-slate-300">
          <p className="font-medium text-slate-100">Your shortlist is empty.</p>
          <p className="mt-1 text-xs text-slate-400">
            From any role detail page, click{" "}
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[0.7rem] font-semibold text-slate-200">
              Add to shortlist
            </span>{" "}
            to pin it here for later.
          </p>
          <p className="mt-3 text-xs">
            <Link
              to="/"
              className="font-medium text-brand-200 underline-offset-2 hover:underline"
            >
              Browse jobs
            </Link>
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map(j => (
            <li
              key={j.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500/70 hover:bg-slate-900 hover:shadow-soft"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={getJobImageUrl(j)}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/10"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Link
                    to={'/job/' + j.id}
                    className="text-sm font-semibold text-slate-50 hover:text-brand-200 md:text-base"
                  >
                    {j.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <Link
                      to={'/company/' + encodeURIComponent(j.company || '')}
                      className="rounded-full bg-slate-900 px-2.5 py-0.5 hover:bg-slate-700 hover:text-slate-100"
                      onClick={e => e.stopPropagation()}
                    >
                      {j.company}
                    </Link>
                    <span>·</span>
                    <span className="text-slate-300">{j.location}</span>
                    <span>·</span>
                    <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.7rem] uppercase tracking-[0.16em] text-slate-300">
                      {j.job_type}
                    </span>
                    {j.posted_at && (
                      <>
                        <span>·</span>
                        <span className="text-slate-500">{relativeTime(j.posted_at)}</span>
                      </>
                    )}
                  </div>
                  {(j.salary || j.experience_level) && (
                    <div className="flex flex-wrap gap-2 text-[0.65rem] text-slate-400">
                      {j.salary && <span>{j.salary}</span>}
                      {j.experience_level && <span className="rounded bg-slate-800/80 px-1.5 py-0.5">{j.experience_level}</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap gap-1 text-[0.7rem] text-slate-400">
                  {String(j.skills || '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
                    .slice(0, 3)
                    .map(skill => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-900/90 px-2 py-0.5"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
                <button
                  type="button"
                  onClick={() => remove(j.id)}
                  className="rounded-xl bg-slate-900 px-3 py-1 text-[0.7rem] font-medium text-slate-200 transition hover:bg-red-500/80 hover:text-white"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
