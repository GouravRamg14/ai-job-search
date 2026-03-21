import { Link } from 'react-router-dom';

/**
 * Split auth layout: brand panel + form area (matches common SaaS sign-in patterns).
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-900/30 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:min-h-[560px] lg:flex-row">
      {/* Brand column */}
      <aside className="relative flex flex-col justify-between border-b border-white/[0.06] bg-gradient-to-br from-brand-600/25 via-slate-900/80 to-slate-950 p-8 sm:p-10 lg:w-[44%] lg:border-b-0 lg:border-r lg:border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-20%,rgba(99,102,241,0.35),transparent)]" />
        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white">
              JD
            </span>
            <span className="tracking-tight">Job Discovery</span>
          </Link>
          <h1 className="mt-10 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">{subtitle}</p> : null}
        </div>
        <ul className="relative mt-10 hidden space-y-3 text-sm text-slate-400 sm:block">
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            AI-ranked roles matched to how you search
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            Save shortlists and browse with filters
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            Secure account with email or Google
          </li>
        </ul>
      </aside>

      {/* Form column */}
      <div className="relative flex flex-1 flex-col justify-center bg-slate-950/40 p-8 sm:p-10">
        <div className="mx-auto w-full max-w-[400px]">{children}</div>
        {footer ? <div className="mx-auto mt-8 w-full max-w-[400px] text-center text-xs text-slate-500">{footer}</div> : null}
      </div>
    </div>
  );
}
