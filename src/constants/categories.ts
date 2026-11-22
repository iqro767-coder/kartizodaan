import type { CategoryId, PriorityLevel, RecurrenceType } from '../types/task';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  color: string;
  textClass: string;
  bgSoftClass: string;
  borderClass: string;
  musicMood: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'Ish',
    label: 'Ish',
    color: '#3B82F6',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgSoftClass: 'bg-blue-500/15 dark:bg-blue-400/15',
    borderClass: 'border-blue-500/30',
    musicMood: 'Diqqatni jamlovchi',
  },
  {
    id: "O'qish",
    label: "O'qish",
    color: '#8B5CF6',
    textClass: 'text-violet-600 dark:text-violet-400',
    bgSoftClass: 'bg-violet-500/15 dark:bg-violet-400/15',
    borderClass: 'border-violet-500/30',
    musicMood: 'Tinch va mulohazali',
  },
  {
    id: 'Sport',
    label: 'Sport',
    color: '#10B981',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgSoftClass: 'bg-emerald-500/15 dark:bg-emerald-400/15',
    borderClass: 'border-emerald-500/30',
    musicMood: 'Tez va kuchli',
  },
  {
    id: 'Uy ishlari',
    label: 'Uy ishlari',
    color: '#F59E0B',
    textClass: 'text-amber-600 dark:text-amber-400',
    bgSoftClass: 'bg-amber-500/15 dark:bg-amber-400/15',
    borderClass: 'border-amber-500/30',
    musicMood: 'Yengil va ritmik',
  },
  {
    id: 'Dam olish',
    label: 'Dam olish',
    color: '#EC4899',
    textClass: 'text-pink-600 dark:text-pink-400',
    bgSoftClass: 'bg-pink-500/15 dark:bg-pink-400/15',
    borderClass: 'border-pink-500/30',
    musicMood: 'Quvnoq',
  },
  {
    id: 'Uyqu',
    label: 'Uyqu',
    color: '#06B6D4',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    bgSoftClass: 'bg-cyan-500/15 dark:bg-cyan-400/15',
    borderClass: 'border-cyan-500/30',
    musicMood: 'Yumshoq',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = CATEGORIES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<CategoryId, CategoryMeta>,
);

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  past: 'Past',
  "o'rta": "O'rta",
  yuqori: 'Yuqori',
};

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  past: 'text-slate-600 dark:text-slate-300',
  "o'rta": 'text-amber-600 dark:text-amber-400',
  yuqori: 'text-rose-600 dark:text-rose-400',
};

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  bir_martalik: 'Bir martalik',
  har_kuni: 'Har kuni',
  hafta_kunlari: 'Haftaning tanlangan kunlari',
  oy_sanasi: 'Har oyning tanlangan sanasi',
};
