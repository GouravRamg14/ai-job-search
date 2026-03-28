import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../api';

export default function ApplyJobModal({ job, open, onClose }) {
  const { user, token } = useAuth();
  const [step, setStep] = useState('form');
  const [refId, setRefId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [experience, setExperience] = useState('');
  const [expectedCtc, setExpectedCtc] = useState('');
  const [currentCtc, setCurrentCtc] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [relocate, setRelocate] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !job) return;
    setStep('form');
    setErr('');
    setFullName(user?.display_name || '');
    setEmail(user?.email || '');
    setPhone('');
    setCity('');
    setLinkedin('');
    setPortfolioUrl('');
    setExperience('');
    setExpectedCtc('');
    setCurrentCtc('');
    setNoticePeriod('');
    setRelocate('');
    setAvailableFrom('');
    setCoverLetter('');
    setConfirmAccurate(false);
    setSubmitting(false);
  }, [open, job, user]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !job) return null;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!token) {
      setErr('You must be signed in to apply.');
      return;
    }
    if (!fullName.trim()) {
      setErr('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setErr('Email is required.');
      return;
    }
    if (!phone.trim()) {
      setErr('Phone number is required.');
      return;
    }
    if (!experience) {
      setErr('Please select years of experience.');
      return;
    }
    if (!expectedCtc) {
      setErr('Please select expected CTC (or choose “Prefer not to say”).');
      return;
    }
    if (!noticePeriod) {
      setErr('Please select notice period.');
      return;
    }
    if (!relocate) {
      setErr('Please indicate willingness to relocate.');
      return;
    }
    if (coverLetter.trim().length < 10) {
      setErr('Please write at least 10 characters in your cover letter.');
      return;
    }
    if (!confirmAccurate) {
      setErr('Please confirm that your information is accurate.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ job_id: job.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save application');
      setRefId(data.application?.ref_id || '');
      setStep('success');
    } catch (e2) {
      setErr(e2.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const applyHref =
    job.apply_url ||
    `mailto:careers@${(job.company || '').replace(/\s+/g, '').toLowerCase()}.example.com?subject=${encodeURIComponent('Application: ' + (job.title || ''))}`;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-title"
        className="relative z-[10000] flex max-h-[min(92vh,800px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.65)]"
      >
        {step === 'form' ? (
          <>
            <div className="shrink-0 border-b border-white/10 px-6 py-4 sm:px-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="apply-title" className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                    Apply for this role
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {job.title} · {job.company} · {job.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Demo application—details are not sent to an employer. Submit to receive a reference ID only.
              </p>
            </div>
            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4 sm:px-8 sm:py-5">
                {err ? (
                  <div className="rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-2 text-sm text-red-100">
                    {err}
                  </div>
                ) : null}

                <div>
                  <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Contact
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-slate-400">Full name *</span>
                      <input
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-400">Work email *</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-400">Phone *</span>
                      <input
                        type="tel"
                        required
                        placeholder="+1 · ···"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-slate-400">Current city (optional)</span>
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bengaluru"
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Profile links
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-400">LinkedIn</span>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/…"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-400">Portfolio / GitHub</span>
                      <input
                        type="url"
                        placeholder="https://…"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Experience & compensation
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-400">Total experience *</span>
                      <select
                        required
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      >
                        <option value="">Select…</option>
                        <option value="0-1">0–1 years</option>
                        <option value="1-3">1–3 years</option>
                        <option value="3-5">3–5 years</option>
                        <option value="5-8">5–8 years</option>
                        <option value="8+">8+ years</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-400">Expected CTC (annual) *</span>
                      <select
                        required
                        value={expectedCtc}
                        onChange={(e) => setExpectedCtc(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      >
                        <option value="">Select range…</option>
                        <option value="lt-6">&lt; ₹6 LPA / &lt; $80k</option>
                        <option value="6-12">₹6–12 LPA / $80k–120k</option>
                        <option value="12-20">₹12–20 LPA / $120k–160k</option>
                        <option value="20-35">₹20–35 LPA / $160k–220k</option>
                        <option value="35+">₹35+ LPA / $220k+</option>
                        <option value="discuss">Open to discussion</option>
                        <option value="undisclosed">Prefer not to say</option>
                      </select>
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-slate-400">Current CTC (optional)</span>
                      <input
                        value={currentCtc}
                        onChange={(e) => setCurrentCtc(e.target.value)}
                        placeholder="e.g. ₹10 LPA — helps recruiters align offers"
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Availability
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-400">Notice period *</span>
                      <select
                        required
                        value={noticePeriod}
                        onChange={(e) => setNoticePeriod(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      >
                        <option value="">Select…</option>
                        <option value="immediate">Immediate / not employed</option>
                        <option value="15d">≤ 15 days</option>
                        <option value="1m">1 month</option>
                        <option value="2m">2 months</option>
                        <option value="3m">3 months</option>
                        <option value="3m+">3+ months</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-400">Willing to relocate? *</span>
                      <select
                        required
                        value={relocate}
                        onChange={(e) => setRelocate(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      >
                        <option value="">Select…</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="depends">Depends on role</option>
                      </select>
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-slate-400">Earliest joining date (optional)</span>
                      <input
                        type="date"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Cover letter
                  </p>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-400">Why you&apos;re a fit *</span>
                    <textarea
                      required
                      minLength={10}
                      rows={5}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Summarize relevant experience, impact, and motivation for this role (min. 10 characters)."
                      className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500/80 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                    />
                    <span className="mt-1 text-[0.65rem] text-slate-600">{coverLetter.length} characters</span>
                  </label>
                </div>

                <label className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                  <input
                    type="checkbox"
                    checked={confirmAccurate}
                    onChange={(e) => setConfirmAccurate(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-900 text-brand-500"
                  />
                  <span className="text-sm text-slate-400">
                    I confirm that the information above is accurate to the best of my knowledge. *
                  </span>
                </label>
              </div>
              <div className="flex shrink-0 gap-2 border-t border-white/10 bg-slate-900/95 px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit application'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col px-6 py-8 text-center sm:px-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-white">Application received</h3>
            <p className="mt-2 text-sm text-slate-400">
              Thank you for applying to <span className="text-slate-200">{job.title}</span> at{' '}
              <span className="text-slate-200">{job.company}</span>.
            </p>
            <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left">
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-slate-500">Reference</p>
              <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-brand-300">{refId}</p>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Save this reference for your records. In a real system, the employer would receive your application and
                may follow up by email.
              </p>
            </div>
            <Link
              to="/applications"
              className="mt-4 text-sm font-medium text-brand-400 hover:text-brand-300"
              onClick={onClose}
            >
              View application status →
            </Link>
            {job.apply_url ? (
              <a
                href={applyHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm font-medium text-slate-400 hover:text-brand-300"
              >
                Open company careers page (optional) ↗
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
