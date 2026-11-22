import type { Task } from '../types/task';

export const UZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

export const UZ_WEEKDAYS_FULL = [
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
  'Yakshanba',
];

export const UZ_WEEKDAYS_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

export function toLocalDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toLocalTimeStr(date: Date = new Date()): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

export function addDays(dateStr: string, days: number): string {
  const dt = parseLocalDate(dateStr);
  dt.setDate(dt.getDate() + days);
  return toLocalDateStr(dt);
}

/** Returns ISO weekday 1 (Monday/Dushanba) .. 7 (Sunday/Yakshanba) */
export function getIsoWeekday(date: Date): number {
  const jsDay = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  return jsDay === 0 ? 7 : jsDay;
}

export function formatUzDateLong(dateStr: string): string {
  const dt = parseLocalDate(dateStr);
  const day = dt.getDate();
  const month = UZ_MONTHS[dt.getMonth()];
  const weekday = UZ_WEEKDAYS_FULL[getIsoWeekday(dt) - 1];
  return `${day}-${month.toLowerCase()}, ${weekday}`;
}

export function formatUzDateShort(dateStr: string): string {
  const dt = parseLocalDate(dateStr);
  const day = dt.getDate();
  const month = UZ_MONTHS[dt.getMonth()];
  return `${day}-${month.slice(0, 3).toLowerCase()}`;
}

export function getStartOfWeek(dateStr: string): string {
  const dt = parseLocalDate(dateStr);
  const isoDay = getIsoWeekday(dt); // 1..7
  dt.setDate(dt.getDate() - (isoDay - 1));
  return toLocalDateStr(dt);
}

export function getWeekDates(startDateStr: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startDateStr, i));
}

export function getMonthCalendarCells(year: number, monthIndex: number): Array<{ dateStr: string; inCurrentMonth: boolean }> {
  const firstDay = new Date(year, monthIndex, 1);
  const startIso = getIsoWeekday(firstDay); // 1..7
  const gridStart = new Date(year, monthIndex, 1 - (startIso - 1));
  const cells: Array<{ dateStr: string; inCurrentMonth: boolean }> = [];
  for (let i = 0; i < 42; i++) {
    const cur = new Date(gridStart);
    cur.setDate(gridStart.getDate() + i);
    cells.push({
      dateStr: toLocalDateStr(cur),
      inCurrentMonth: cur.getMonth() === monthIndex,
    });
  }
  return cells;
}

export function doesTaskOccurOnDate(task: Task, dateStr: string): boolean {
  if (task.otkazilganSanalar?.includes(dateStr)) {
    return false;
  }
  if (task.qoshimchaSanalar?.includes(dateStr)) {
    return true;
  }
  if (dateStr < task.sana) {
    return false;
  }
  switch (task.takrorlanish) {
    case 'bir_martalik':
      return task.sana === dateStr;
    case 'har_kuni':
      return true;
    case 'hafta_kunlari': {
      const isoDay = getIsoWeekday(parseLocalDate(dateStr));
      return Boolean(task.haftaKunlari?.includes(isoDay));
    }
    case 'oy_sanasi': {
      const dayOfMonth = parseLocalDate(dateStr).getDate();
      return task.oySanasi === dayOfMonth;
    }
    default:
      return task.sana === dateStr;
  }
}

export function isTaskCompletedOnDate(task: Task, dateStr: string): boolean {
  if (task.takrorlanish === 'bir_martalik') {
    return task.bajarildi;
  }
  return Boolean(task.bajarilganSanalar?.includes(dateStr));
}

export function getTaskOccurrenceTimestamp(dateStr: string, timeStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0).getTime();
}

export function isTaskOverdueTodayOrPast(task: Task, now: Date = new Date()): { overdue: boolean; overdueDate: string | null } {
  const todayStr = toLocalDateStr(now);
  const nowTime = toLocalTimeStr(now);

  if (task.takrorlanish === 'bir_martalik') {
    if (task.bajarildi) return { overdue: false, overdueDate: null };
    if (task.sana < todayStr) {
      return { overdue: true, overdueDate: task.sana };
    }
    if (task.sana === todayStr && task.vaqt && task.vaqt < nowTime) {
      return { overdue: true, overdueDate: todayStr };
    }
    return { overdue: false, overdueDate: null };
  }

  // For recurring tasks, check if today's occurrence time has already passed without completion
  if (
    doesTaskOccurOnDate(task, todayStr) &&
    !isTaskCompletedOnDate(task, todayStr) &&
    task.vaqt &&
    task.vaqt < nowTime
  ) {
    return { overdue: true, overdueDate: todayStr };
  }

  return { overdue: false, overdueDate: null };
}

export function formatCountdownUz(diffMs: number): string {
  if (diffMs <= 0) return 'Hozir';
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} soat ${String(minutes).padStart(2, '0')} daqiqa`;
  }
  if (minutes > 0) {
    return `${minutes} daqiqa ${String(seconds).padStart(2, '0')} soniya`;
  }
  return `${seconds} soniya`;
}
