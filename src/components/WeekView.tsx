import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Task } from '../types/task';
import {
  addDays,
  doesTaskOccurOnDate,
  formatUzDateLong,
  formatUzDateShort,
  getStartOfWeek,
  getWeekDates,
  isTaskCompletedOnDate,
  toLocalDateStr,
} from '../utils/dateUz';
import { TaskRow } from './TaskRow';

interface WeekViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task, dateStr: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskForDate: (dateStr: string) => void;
}

export function WeekView({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskForDate,
}: WeekViewProps) {
  const todayStr = toLocalDateStr();
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(todayStr));

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/80">
            {formatUzDateShort(weekDates[0])} — {formatUzDateShort(weekDates[6])}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
            Haftalik reja
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((prev) => addDays(prev, -7))}
            aria-label="Oldingi hafta"
            className="min-w-[44px] min-h-[44px] rounded-xl glass-surface flex items-center justify-center text-slate-800 dark:text-white cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(getStartOfWeek(todayStr))}
            className="min-h-[44px] px-4 rounded-xl glass-surface text-xs sm:text-sm font-semibold text-slate-900 dark:text-white cursor-pointer whitespace-nowrap"
          >
            Joriy hafta
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((prev) => addDays(prev, 7))}
            aria-label="Keyingi hafta"
            className="min-w-[44px] min-h-[44px] rounded-xl glass-surface flex items-center justify-center text-slate-800 dark:text-white cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {weekDates.map((dateStr) => {
          const dayTasks = tasks
            .filter((t) => doesTaskOccurOnDate(t, dateStr))
            .sort((a, b) => (a.vaqt || '00:00').localeCompare(b.vaqt || '00:00'));
          const isToday = dateStr === todayStr;

          return (
            <section
              key={dateStr}
              className={`glass-surface rounded-3xl p-4 sm:p-5 ${
                isToday ? 'ring-2 ring-indigo-500/60 dark:ring-indigo-400/60' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize truncate">
                    {formatUzDateLong(dateStr)}
                  </h2>
                  {isToday && (
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 whitespace-nowrap">
                      · Bugun
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenNewTaskForDate(dateStr)}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Qo‘shish</span>
                </button>
              </div>

              {dayTasks.length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 py-1">
                  Bu kun uchun rejalashtirilgan ishlar yo‘q.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {dayTasks.map((task) => (
                    <TaskRow
                      key={`${dateStr}-${task.id}`}
                      task={task}
                      occurrenceDate={dateStr}
                      completed={isTaskCompletedOnDate(task, dateStr)}
                      onToggleComplete={onToggleComplete}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
