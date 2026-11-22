export type CategoryId =
  | 'Ish'
  | "O'qish"
  | 'Sport'
  | 'Uy ishlari'
  | 'Dam olish'
  | 'Uyqu';

export type PriorityLevel = 'past' | "o'rta" | 'yuqori';

export type RecurrenceType =
  | 'bir_martalik'
  | 'har_kuni'
  | 'hafta_kunlari'
  | 'oy_sanasi';

export type MusicMode = 'auto' | 'preset' | 'custom';

export interface TaskMusicConfig {
  mode: MusicMode;
  presetId?: string;
  customAudioId?: string;
  customAudioName?: string;
}

export interface Task {
  id: string;
  nomi: string;
  izoh: string;
  sana: string; // YYYY-MM-DD (local date)
  vaqt: string; // HH:mm
  toifa: CategoryId;
  muhimlik: PriorityLevel;
  takrorlanish: RecurrenceType;
  /** ISO weekdays: 1 = Dushanba ... 7 = Yakshanba */
  haftaKunlari?: number[];
  /** Day of month: 1..31 */
  oySanasi?: number;
  /** Completion status for one-time tasks */
  bajarildi: boolean;
  /** Completion dates (YYYY-MM-DD) for recurring tasks */
  bajarilganSanalar?: string[];
  /** Dates explicitly skipped (e.g. moved to tomorrow) for recurring tasks */
  otkazilganSanalar?: string[];
  /** Extra occurrence dates added when a recurring instance is moved */
  qoshimchaSanalar?: string[];
  musiqa: TaskMusicConfig;
  createdAt: string;
}

export interface UserHistoryItem {
  nomi: string;
  toifa: CategoryId;
  lastUsedAt: number;
  count: number;
}

export type AppView = 'dashboard' | 'today' | 'week' | 'month' | 'settings';

export type ThemeMode = 'light' | 'dark';

export interface ActiveReminder {
  taskId: string;
  occurrenceDate: string;
  triggeredAt: number;
  snoozed?: boolean;
}

export interface SnoozedReminder {
  taskId: string;
  occurrenceDate: string;
  triggerAtMs: number;
}
