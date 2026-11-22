import type { CategoryId, Task, ThemeMode, UserHistoryItem } from '../types/task';
import { normalizeUzbek } from './uzbekNormalize';

const KEYS = {
  USER_NAME: 'mylife_user_name',
  THEME: 'mylife_theme',
  TASKS: 'mylife_tasks',
  HISTORY: 'mylife_history',
  VOLUME: 'mylife_volume',
};

export function getStoredUserName(): string | null {
  try {
    const val = localStorage.getItem(KEYS.USER_NAME);
    return val && val.trim() ? val.trim() : null;
  } catch {
    return null;
  }
}

export function saveUserName(name: string): void {
  try {
    localStorage.setItem(KEYS.USER_NAME, name.trim());
  } catch {
    // ignore storage errors
  }
}

export function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(KEYS.THEME);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch {
    // ignore
  }
}

export function getStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export function getStoredVolume(): number {
  try {
    const raw = localStorage.getItem(KEYS.VOLUME);
    if (raw === null) return 0.7;
    const num = Number(raw);
    if (Number.isFinite(num) && num >= 0 && num <= 1) {
      return num;
    }
  } catch {
    // ignore
  }
  return 0.7;
}

export function saveVolume(volume: number): void {
  try {
    localStorage.setItem(KEYS.VOLUME, String(Math.min(1, Math.max(0, volume))));
  } catch {
    // ignore
  }
}

export function getStoredHistory(): UserHistoryItem[] {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordUserTaskHistory(nomi: string, toifa: CategoryId): UserHistoryItem[] {
  const clean = nomi.trim();
  if (!clean) return getStoredHistory();
  const norm = normalizeUzbek(clean);
  const existing = getStoredHistory();
  const idx = existing.findIndex((item) => normalizeUzbek(item.nomi) === norm);
  const updated = [...existing];
  if (idx >= 0) {
    updated[idx] = {
      nomi: clean,
      toifa,
      lastUsedAt: Date.now(),
      count: existing[idx].count + 1,
    };
  } else {
    updated.unshift({
      nomi: clean,
      toifa,
      lastUsedAt: Date.now(),
      count: 1,
    });
  }
  const sorted = updated
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    .slice(0, 150);
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(sorted));
  } catch {
    // ignore
  }
  return sorted;
}

export function clearAllAppData(): void {
  try {
    localStorage.removeItem(KEYS.TASKS);
    localStorage.removeItem(KEYS.HISTORY);
  } catch {
    // ignore
  }
}
