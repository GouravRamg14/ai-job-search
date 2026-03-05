/**
 * Returns a URL for the job/company image. Uses stored image_url or a placeholder
 * (company initials) so it works for older shortlisted items without image_url.
 */
export function getJobImageUrl(job) {
  if (job?.image_url) return job.image_url;
  const name = encodeURIComponent((job?.company || 'Company').trim() || 'Company');
  return `https://ui-avatars.com/api/?name=${name}&size=256&background=4f46e5&color=fff&bold=1`;
}
