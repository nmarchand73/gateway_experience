const STORAGE_KEY = 'gateway-progress-v1';
const JOURNAL_PREFIX = 'gateway-journal-';

export interface ProgressState {
  completed: string[];
}

function readProgress(): ProgressState {
  if (typeof localStorage === 'undefined') return { completed: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [] };
    return JSON.parse(raw) as ProgressState;
  } catch {
    return { completed: [] };
  }
}

export function isSessionComplete(sessionId: string): boolean {
  return readProgress().completed.includes(sessionId);
}

export function markSessionComplete(sessionId: string, done: boolean): void {
  const state = readProgress();
  const set = new Set(state.completed);
  if (done) set.add(sessionId);
  else set.delete(sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: [...set] }));
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getJournal(sessionId: string): string {
  try {
    return localStorage.getItem(JOURNAL_PREFIX + sessionId) || '';
  } catch {
    return '';
  }
}

export function saveJournal(sessionId: string, text: string): void {
  localStorage.setItem(JOURNAL_PREFIX + sessionId, text);
}
