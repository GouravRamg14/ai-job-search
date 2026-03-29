import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API } from '../api';
import { getJobImageUrl } from '../utils/jobImage';
import { relativeTime } from '../utils/relativeTime';
import { APPLICATION_STAGES, progressPercent } from '../utils/applicationsStorage';

export default function AppliedJobs() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');

  const refresh = useCallback(async () => {
    if (!token) {
      setList([]);
      setLoading(false);
      return;
    }
    setLoadErr('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to load applications');
      setList(Array.isArray(data.applications) ? data.applications : []);
    } catch (e) {
      setLoadErr(e.message || 'Failed to load');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = async (jobId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/applications/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not remove');
      await refresh();
    } catch (e) {
      setLoadErr(e.message || 'Remove failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50 md:text-2xl">Applications</h1>
          <p className="text-xs text-slate-400 md:text-sm">
            Signed in as <span className="text-slate-300">{user?.email}</span>. Applications are stored on the server;
            status is an illustrative pipeline for your reference.
          </p>
        </div>
        <Link
          to="/"
          className="text-xs font-medium text-brand-200 underline-offset-2 hover:underline md:text-sm"
        >
          ← Browse more roles
        </Link>
      </div>

      {loadErr ? (
        <div className="rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
          {loadErr}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-5 py-8 text-sm text-slate-300">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400" />
          Loading applications…
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-5 py-6 text-sm text-slate-300">
          <p className="font-medium text-slate-100">No applications yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            When you apply to a role, it will appear here with a simple hiring pipeline view.
          </p>
          <p className="mt-3 text-xs">
            <Link to="/" className="font-medium text-brand-200 underline-offset-2 hover:underline">
              Find roles to apply
            </Link>
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((entry) => {
            const j = entry.job;
            const stageIdx = Math.min(
              Math.max(0, entry.progress_stage ?? 0),
              APPLICATION_STAGES.length - 1,
            );
            const stage = APPLICATION_STAGES[stageIdx];
            const pct = progressPercent(stageIdx);
            const next =
              stageIdx < APPLICATION_STAGES.length - 1 ? APPLICATION_STAGES[stageIdx + 1] : null;

            return (
              <li
                key={entry.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-sm"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="flex min-w-0 gap-4">
                    <img
                      src={getJobImageUrl(j)}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                    />
                    <div className="min-w-0 space-y-1">
                      <Link
                        to={`/job/${j.id}`}
                        className="text-base font-semibold text-slate-50 hover:text-brand-200"
                      >
                        {j.title}
                      </Link>
                      <p className="text-sm text-slate-400">{j.company}</p>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span>{j.location}</span>
                        {j.job_type ? (
                          <>
                            <span>·</span>
                            <span>{j.job_type}</span>
                          </>
                        ) : null}
                        {j.salary ? (
                          <>
                            <span>·</span>
                            <span>{j.salary}</span>
                          </>
                        ) : null}
                      </div>
                      <p className="pt-1 font-mono text-[0.7rem] text-slate-500">
                        Ref <span className="text-brand-300/90">{entry.ref_id}</span>
                        <span className="mx-2 text-slate-600">·</span>
                        Applied {relativeTime(entry.applied_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(j.id)}
                    className="shrink-0 self-start rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-red-500/40 hover:bg-red-950/30 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>

                <div className="border-t border-white/[0.06] bg-slate-900/50 px-4 py-4 sm:px-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Status
                    </span>
                    <span className="text-xs font-medium text-brand-300">{pct}%</span>
                  </div>
                  <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {APPLICATION_STAGES.map((s, i) => (
                      <span
                        key={s.label}
                        className={[
                          'rounded-full px-2.5 py-1 text-[0.65rem] font-medium',
                          i <= stageIdx
                            ? 'bg-brand-500/20 text-brand-200 ring-1 ring-brand-500/30'
                            : 'bg-slate-900 text-slate-600 ring-1 ring-white/[0.06]',
                        ].join(' ')}
                      >
                        {i + 1}. {s.label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-slate-950/60 px-3 py-2.5">
                    <p className="text-sm font-medium text-slate-200">{stage.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{stage.detail}</p>
                    {next ? (
                      <p className="mt-2 border-t border-white/[0.06] pt-2 text-[0.7rem] text-slate-600">
                        Next stage: <span className="text-slate-500">{next.label}</span>
                      </p>
                    ) : (
                      <p className="mt-2 border-t border-white/[0.06] pt-2 text-[0.7rem] text-slate-600">
                        Final stage in this view.
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
