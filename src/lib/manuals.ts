import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manualsRoot = path.join(__dirname, '../../content/manuals');

export interface ManualIndexWave {
  slug: string;
  roman: string;
  title: string;
  sourcePdf: string;
  pages: number;
  markdownFile: string;
  sessions: Array<{
    sessionId: string;
    index: number;
    title: string;
    heading: string;
    file: string;
  }>;
}

export interface ManualIndex {
  extractedAt: string;
  waves: ManualIndexWave[];
}

let cachedIndex: ManualIndex | null = null;

export function loadManualIndex(): ManualIndex | null {
  if (cachedIndex) return cachedIndex;
  const indexPath = path.join(manualsRoot, 'index.json');
  if (!fs.existsSync(indexPath)) return null;
  cachedIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as ManualIndex;
  return cachedIndex;
}

/** Strip YAML frontmatter and return body text. */
export function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---')) return markdown;
  const end = markdown.indexOf('\n---', 3);
  if (end === -1) return markdown;
  return markdown.slice(end + 4).replace(/^\n/, '');
}

function readManualFile(relativePath: string): string | null {
  const full = path.join(manualsRoot, relativePath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf-8');
}

/** Full wave manual body (no frontmatter). */
export function getWaveManualBody(waveSlug: string): string | null {
  const raw = readManualFile(`${waveSlug}.md`);
  return raw ? stripFrontmatter(raw) : null;
}

/** Session exercise notes from the wave manual, if extracted. */
export function getSessionManualBody(sessionId: string): string | null {
  const raw = readManualFile(`sessions/${sessionId}.md`);
  return raw ? stripFrontmatter(raw) : null;
}

/** v2 Wave VII (Odyssey) reuses classic Wave VI manual slices. */
const V2_ODyssey_SESSION = /^wave-vii-(\d+)$/;

export function resolveManualSessionId(sessionId: string, waveSlug: string): string {
  const odyssey = sessionId.match(V2_ODyssey_SESSION);
  if (odyssey) return `wave-vi-${odyssey[1].padStart(2, '0')}`;
  return sessionId;
}

export function resolveManualWaveSlug(waveSlug: string): string {
  if (waveSlug === 'wave-vii') return 'wave-vi';
  return waveSlug;
}

/**
 * Load exercise notes for a session page.
 * @param hasSourceManual — true when classic PDF manual applies (classic edition or v2 Odyssey).
 */
export function getManualForSession(
  sessionId: string,
  waveSlug: string,
  hasSourceManual = true,
): string | null {
  if (!hasSourceManual) return null;
  const manualSessionId = resolveManualSessionId(sessionId, waveSlug);
  const manualWaveSlug = resolveManualWaveSlug(waveSlug);
  return (
    getSessionManualBody(manualSessionId) ?? getWaveManualBody(manualWaveSlug)
  );
}

/** OCR cleanup: split manual body into readable paragraphs for display. */
export function formatManualParagraphs(body: string): { title: string | null; paragraphs: string[] } {
  let text = body
    .replace(/```[\s\S]*?```/g, '\n')
    .replace(/```/g, '')
    .replace(/^\s*\d{1,3}\s*$/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const chunks = text.split(/\n\n+/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);

  if (chunks.length === 0) return { title: null, paragraphs: [] };

  const first = chunks[0];
  const looksLikeTitle =
    first.length < 120 &&
    !first.endsWith('.') &&
    (first.includes('—') || first.includes('#') || /^[A-Za-z][\w\s™®—\-#]+$/u.test(first));

  if (looksLikeTitle) {
    return { title: first, paragraphs: chunks.slice(1) };
  }

  return { title: null, paragraphs: chunks };
}
