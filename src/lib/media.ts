const siteBase = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '';
const externalBase = (import.meta.env.PUBLIC_MEDIA_BASE_URL || '').replace(/\/$/, '');

/** GitHub LFS audio/PDF in data/ — used when Pages build skips local media copy. */
export const GITHUB_MEDIA_BASE =
  'https://github.com/nmarchand73/gateway_experience/raw/main/data';

function pagesUseGithubMedia(): boolean {
  return import.meta.env.PUBLIC_MEDIA_HOSTED === 'false' && !externalBase;
}

function mediaRoot(): string {
  if (externalBase) return externalBase;
  if (pagesUseGithubMedia()) return GITHUB_MEDIA_BASE;
  return `${siteBase}/media`;
}

/** True when session audio/PDF URLs resolve to something other than missing Pages /media/. */
export function isMediaHosted(): boolean {
  if (externalBase || pagesUseGithubMedia()) return true;
  return import.meta.env.PUBLIC_MEDIA_HOSTED !== 'false';
}

/** Media URL: local `{BASE_URL}media/`, GitHub raw/LFS on Pages, or PUBLIC_MEDIA_BASE_URL CDN. */
export function resolveMediaUrl(relativePath: string): string {
  const clean = relativePath.replace(/\\/g, '/').replace(/^\//, '');
  const encoded = clean.split('/').map((part) => encodeURIComponent(part)).join('/');
  return `${mediaRoot()}/${encoded}`;
}

export function resolvePdfUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  return resolveMediaUrl(relativePath);
}

/** Declassified US Army assessment of Monroe Institute Hemi-Sync (McDonnell, 1983). */
export const CIA_GATEWAY_REPORT_PATH = 'cia-gateway-experience.pdf';
