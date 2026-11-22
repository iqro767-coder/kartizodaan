import { BellRing, Check, Clock, VolumeX, X } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORY_MAP } from '../constants/categories';
import type { Task } from '../types/task';
import { CategoryIcon } from './CategoryIcon';

interface ReminderModalProps {
  task: Task | null;
  occurrenceDate: string;
  isMusicPlaying: boolean;
  onComplete: () => void;
  onSnooze: (minutes: 5 | 10 | 15) => void;
  onStopMusic: () => void;
  onDismiss: () => void;
}

export function ReminderModal({
  task,
  isMusicPlaying,
  onComplete,
  onSnooze,
  onStopMusic,
  onDismiss,
}: ReminderModalProps) {
  if (!task) return null;

  const cat = CATEGORY_MAP[task.toifa];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative"
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Oynani yopish"
          className="absolute top-4 right-4 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-300">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 flex items-center justify-center">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-300">
              Ish vaqti keldi
            </div>
            <div className="text-sm font-mono-tabular text-slate-600 dark:text-slate-300">
              {task.vaqt || 'Hozir'}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            <CategoryIcon category={task.toifa} className={`w-4 h-4 ${cat.textClass}`} />
            <span className={cat.textClass}>{cat.label}</span>
          </div>
          <h2
            id="reminder-modal-title"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance"
          >
            {task.nomi}
          </h2>
          {task.izoh && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {task.izoh}
            </p>
          )}
        </div>

        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={onComplete}
            className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <Check className="w-5 h-5" />
            <span>Bajarildi</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            {([5, 10, 15] as const).map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => onSnooze(mins)}
                className="min-h-[44px] px-2.5 py-2 rounded-xl bg-white/75 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{mins} daqiqa</span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            5 / 10 / 15 daqiqaga qoldirish
          </p>

          <button
            type="button"
            onClick={onStopMusic}
            disabled={!isMusicPlaying}
            className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
              isMusicPlaying
                ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/35 text-rose-700 dark:text-rose-300 cursor-pointer'
                : 'bg-slate-900/5 dark:bg-white/5 border-slate-200/70 dark:border-white/10 text-slate-400 dark:text-slate-500 cursor-default'
            }`}
          >
            <VolumeX className="w-4 h-4" />
            <span>{isMusicPlaying ? 'Musiqani to‘xtatish' : 'Musiqa to‘xtatilgan'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
