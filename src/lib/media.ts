const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '';

/** Media URL: dev serves from `{BASE_URL}media/` via Vite; prod from dist/media/ */
export function resolveMediaUrl(relativePath: string): string {
  const clean = relativePath.replace(/\\/g, '/').replace(/^\//, '');
  const encoded = clean.split('/').map((part) => encodeURIComponent(part)).join('/');
  return `${base}/media/${encoded}`;
}

export function resolvePdfUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  return resolveMediaUrl(relativePath);
}

/** Declassified US Army assessment of Monroe Institute Hemi-Sync (McDonnell, 1983). */
export const CIA_GATEWAY_REPORT_PATH = 'cia-gateway-experience.pdf';
