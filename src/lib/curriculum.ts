import fs from 'node:fs';
import path from 'node:path';

export type EditionId = 'classic' | 'v2';

export interface AudioRef {
  path: string;
  sha256: string;
  format: string;
}

export interface SessionFrequencies {
  focusLevel: number;
  beatHz: number;
  leftHz: number | null;
  rightHz: number | null;
  bandLabel: { en: string; fr: string };
  reviewed: boolean;
}

export interface Session {
  id: string;
  waveSlug: string;
  index: number;
  title: { en: string; fr: string };
  audio: { en?: AudioRef; fr?: AudioRef };
  manualPdf: string | null;
  frequencies: SessionFrequencies;
}

export interface Wave {
  roman: string;
  slug: string;
  focusLevel: number;
  title: { en: string; fr: string };
  beatHz: number;
  bandLabel: { en: string; fr: string };
  manualPdf: string | null;
  sessions: string[];
}

export interface Edition {
  id: EditionId;
  label: { en: string; fr: string };
  description: { en: string; fr: string };
  audioLang: string;
  waves: Wave[];
  sessions: Session[];
}

export interface Curriculum {
  generatedAt: string;
  defaultEdition?: EditionId;
  editions?: Record<EditionId, Edition>;
  waves: Wave[];
  sessions: Session[];
  supplements: {
    mindFood: Supplement[];
    humainPlus: Supplement[];
  };
  glossary: GlossaryEntry[];
}

export interface Supplement {
  id: string;
  title: { fr: string; en: string };
  audio: AudioRef;
  category: string;
}

export interface GlossaryEntry {
  focus: number;
  title: { en: string; fr: string };
  desc: { en: string; fr: string };
}

let cached: Curriculum | null = null;

export function loadCurriculum(): Curriculum {
  if (cached) return cached;
  const file = path.join(process.cwd(), 'content', 'curriculum.json');
  cached = JSON.parse(fs.readFileSync(file, 'utf-8')) as Curriculum;
  return cached;
}

export function getEdition(id: EditionId = 'classic'): Edition {
  const c = loadCurriculum();
  const edition = c.editions?.[id];
  if (edition) return edition;
  return {
    id: 'classic',
    label: { en: 'Classic release (FLAC)', fr: 'Version classique (FLAC)' },
    description: { en: '', fr: '' },
    audioLang: 'mixed',
    waves: c.waves,
    sessions: c.sessions,
  };
}

export function listEditions(): Edition[] {
  const c = loadCurriculum();
  if (c.editions) return Object.values(c.editions);
  return [getEdition('classic')];
}

export function hasEdition(id: EditionId): boolean {
  return Boolean(loadCurriculum().editions?.[id]);
}

export function getWave(slug: string, edition: EditionId = 'classic'): Wave | undefined {
  return getEdition(edition).waves.find((w) => w.slug === slug);
}

export function getSession(id: string, edition: EditionId = 'classic'): Session | undefined {
  return getEdition(edition).sessions.find((s) => s.id === id);
}

export function getSessionsForWave(waveSlug: string, edition: EditionId = 'classic'): Session[] {
  return getEdition(edition).sessions.filter((s) => s.waveSlug === waveSlug);
}

export function progressKey(sessionId: string, edition: EditionId = 'classic'): string {
  return edition === 'classic' ? sessionId : `${edition}:${sessionId}`;
}

import type { Locale } from '../i18n';
import { localePrefix } from '../i18n';

export function sessionTitle(session: Session, locale: Locale): string {
  return locale === 'fr' ? session.title.fr : session.title.en;
}

export function waveTitle(wave: Wave, locale: Locale): string {
  return locale === 'fr' ? wave.title.fr : wave.title.en;
}

export function editionLabel(edition: Edition, locale: Locale): string {
  return locale === 'fr' ? edition.label.fr : edition.label.en;
}

export function editionDescription(edition: Edition, locale: Locale): string {
  return locale === 'fr' ? edition.description.fr : edition.description.en;
}

export function pickAudio(
  session: Session,
  locale: Locale,
  edition: EditionId = 'classic',
): AudioRef | undefined {
  if (edition === 'v2') return session.audio.en ?? session.audio.fr;
  if (locale === 'fr' && session.audio.fr) return session.audio.fr;
  return session.audio.en ?? session.audio.fr;
}

export function wavesBasePath(locale: Locale, edition: EditionId = 'classic'): string {
  const p = localePrefix(locale);
  return edition === 'classic' ? `${p}/waves` : `${p}/v2/waves`;
}

export function sessionPath(session: Session, locale: Locale, edition: EditionId = 'classic'): string {
  return `${wavesBasePath(locale, edition)}/${session.waveSlug}/${session.id}/`;
}

export function getAdjacentSessions(
  waveSlug: string,
  sessionId: string,
  edition: EditionId = 'classic',
): { prev: Session | null; next: Session | null } {
  const sessions = getSessionsForWave(waveSlug, edition).sort((a, b) => a.index - b.index);
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? sessions[idx - 1]! : null,
    next: idx < sessions.length - 1 ? sessions[idx + 1]! : null,
  };
}
