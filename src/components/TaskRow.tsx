import { ArrowRight, Check, Pencil, Repeat, Trash2 } from 'lucide-react';
import { CATEGORY_MAP, PRIORITY_COLORS, PRIORITY_LABELS, RECURRENCE_LABELS } from '../constants/categories';
import type { Task } from '../types/task';
import { formatUzDateShort } from '../utils/dateUz';
import { CategoryIcon } from './CategoryIcon';

interface TaskRowProps {
  task: Task;
  occurrenceDate: string;
  completed: boolean;
  isOverdue?: boolean;
  onToggleComplete: (task: Task, dateStr: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMoveToTomorrow?: (task: Task, overdueDate: string) => void;
}

export function TaskRow({
  task,
  occurrenceDate,
  completed,
  isOverdue = false,
  onToggleComplete,
  onEdit,
  onDelete,
  onMoveToTomorrow,
}: TaskRowProps) {
  const cat = CATEGORY_MAP[task.toifa];

  return (
    <div
      className={`group rounded-2xl p-3.5 sm:p-4 border transition-all duration-150 ${
        isOverdue
          ? 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/35'
          : completed
            ? 'bg-white/45 dark:bg-white/[0.04] border-slate-200/60 dark:border-white/10 opacity-75'
            : 'bg-white/75 dark:bg-white/[0.07] border-slate-200/80 dark:border-white/12 hover:bg-white/95 dark:hover:bg-white/[0.11]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion toggle with 44px touch target */}
        <button
          type="button"
          onClick={() => onToggleComplete(task, occurrenceDate)}
          aria-label={completed ? `${task.nomi} bajarilmagan deb belgilash` : `${task.nomi} bajarildi deb belgilash`}
          className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center shrink-0 cursor-pointer"
        >
          <span
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
              completed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : isOverdue
                  ? 'border-rose-500/70 hover:border-rose-600 bg-white/60 dark:bg-slate-900/40'
                  : 'border-slate-300 dark:border-white/30 hover:border-indigo-500 bg-white/60 dark:bg-slate-900/40'
            }`}
          >
            {completed && <Check className="w-4 h-4 stroke-[2.5]" />}
          </span>
        </button>

        {/* Main task details */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cat.bgSoftClass} ${cat.textClass}`}
              title={cat.label}
            >
              <CategoryIcon category={task.toifa} className="w-3.5 h-3.5" />
            </span>

            <h3
              className={`text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate ${
                completed ? 'line-through text-slate-500 dark:text-slate-400' : ''
              }`}
            >
              {task.nomi}
            </h3>

            {isOverdue && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                Muddati o‘tgan
              </span>
            )}
          </div>

          {task.izoh && (
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              {task.izoh}
            </p>
          )}

          {/* Clean unboxed metadata row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
            <span className={`font-medium ${cat.textClass}`}>{cat.label}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular font-medium">
              {formatUzDateShort(occurrenceDate)}, {task.vaqt || '09:00'}
            </span>
            <span aria-hidden="true">·</span>
            <span className={`font-medium ${PRIORITY_COLORS[task.muhimlik]}`}>
              {PRIORITY_LABELS[task.muhimlik]} muhimlik
            </span>
            {task.takrorlanish !== 'bir_martalik' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Repeat className="w-3 h-3" aria-hidden="true" />
                  <span>{RECURRENCE_LABELS[task.takrorlanish]}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isOverdue && onMoveToTomorrow && (
            <button
              type="button"
              onClick={() => onMoveToTomorrow(task, occurrenceDate)}
              title="Ertaga ko‘chirish"
              className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="hidden sm:inline">Ertaga</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`${task.nomi}ni tahrirlash`}
            title="Tahrirlash"
            className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label={`${task.nomi}ni o‘chirish`}
            title="O‘chirish"
            className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
