/** Labels for progress_stage index returned by GET /api/applications. */

export const APPLICATION_STAGES = [
  { label: 'Submitted', detail: 'Application received by the employer portal.' },
  { label: 'Under review', detail: 'The hiring team is screening applications.' },
  { label: 'Recruiter screen', detail: 'A recruiter may follow up with clarifying questions.' },
  { label: 'Interview', detail: 'Interview or technical round.' },
  { label: 'Decision', detail: 'Offer or outcome pending.' },
];

export function progressPercent(stageIndex) {
  const n = APPLICATION_STAGES.length;
  if (n <= 1) return 100;
  const idx = Math.min(Math.max(0, stageIndex), n - 1);
  return Math.round(((idx + 1) / n) * 100);
}
