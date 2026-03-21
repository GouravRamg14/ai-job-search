import { useEffect } from 'react';

export default function ConfirmModal({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition ${
              danger
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-brand-600 hover:bg-brand-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
