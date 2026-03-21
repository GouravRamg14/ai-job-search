import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../api';
import { getJobImageUrl } from '../utils/jobImage';
import { relativeTime } from '../utils/relativeTime';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    fetch(API + '/jobs/' + id)
      .then(res => res.json())
      .then(data => setJob(data))
      .catch(console.error);
    fetch(API + '/jobs/' + id + '/similar')
      .then(res => res.json())
      .then(data => setSimilar(data))
      .catch(console.error);
  }, [id]);

  const addToShortlist = () => {
    const list = JSON.parse(localStorage.getItem('shortlist') || '[]');
    if (!list.find(j => j.id === job.id)) {
      list.push(job);
      localStorage.setItem('shortlist', JSON.stringify(list));
      alert('Added to shortlist!');
    }
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
          <span>Loading role details…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-brand-200"
        >
          <span className="text-sm">←</span>
          <span>Back to all roles</span>
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,2fr),minmax(0,1.3fr)]">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-soft backdrop-blur-md">
          <div className="flex gap-4">
            <img
              src={getJobImageUrl(job)}
              alt=""
              className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="text-xl font-semibold text-slate-50 md:text-2xl">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <Link
                  to={'/company/' + encodeURIComponent(job.company || '')}
                  className="rounded-full bg-slate-900 px-2.5 py-0.5 hover:bg-slate-800 hover:text-brand-200"
                >
                  {job.company}
                </Link>
                <span>·</span>
                <span className="text-slate-200">{job.location}</span>
                <span>·</span>
                <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-200">
                  {job.job_type}
                </span>
                {job.posted_at && (
                  <>
                    <span>·</span>
                    <span className="text-slate-500">{relativeTime(job.posted_at)}</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {job.salary && <span className="text-slate-300">{job.salary}</span>}
                {job.experience_level && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-400">{job.experience_level}</span>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-200">
            {job.description}
          </p>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Key skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {String(job.skills || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(skill => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[0.7rem] text-slate-200"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={addToShortlist}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98]"
            >
              Add to shortlist
              <span className="text-xs text-brand-100/90">for later review</span>
            </button>
            {(job.apply_url || job.company) && (
              <a
                href={job.apply_url || `mailto:careers@${(job.company || '').replace(/\s+/g, '').toLowerCase()}.example.com?subject=Application: ${encodeURIComponent(job.title || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 hover:text-white"
              >
                Apply on company site
                <span className="text-xs text-slate-400">↗</span>
              </a>
            )}
          </div>
        </section>

        <aside className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-soft backdrop-blur-md">
          <h2 className="text-sm font-semibold text-slate-50">
            Similar roles
          </h2>
          <p className="text-xs text-slate-400">
            Based on matching title, description and skills.
          </p>

          {similar.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">
              We&apos;ll show similar roles here once there are more close matches.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {similar.map(j => (
                <li
                  key={j.id}
                  className="group flex gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3 transition hover:border-brand-500/70 hover:bg-slate-900"
                >
                  <img
                    src={getJobImageUrl(j)}
                    alt=""
                    className="h-10 w-10 flex-shrink-0 rounded-lg object-cover ring-1 ring-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={'/job/' + j.id}
                      className="font-medium text-slate-100 group-hover:text-brand-200"
                    >
                      {j.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{j.company}</span>
                      <span>·</span>
                      <span>{j.job_type}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
