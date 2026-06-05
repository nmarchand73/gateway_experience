import fr from './fr.json';
import en from './en.json';

const strings = { fr, en } as Record<string, Record<string, unknown>>;

export type Locale = 'fr' | 'en';

export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: unknown = strings[locale] ?? strings.fr;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }
  let str = typeof value === 'string' ? value : key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '';

export function getBase(): string {
  return base;
}

export function assetPath(path: string): string {
  const p = path.replace(/^\//, '');
  return base ? `${base}/${p}` : `/${p}`;
}

export function localePrefix(locale: Locale): string {
  return locale === 'en' ? `${base}/en` : base;
}
