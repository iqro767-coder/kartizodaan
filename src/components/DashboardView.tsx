import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Plus,
  Search,
} from 'lucide-react';
import type { Task } from '../types/task';
import {
  doesTaskOccurOnDate,
  formatCountdownUz,
  formatUzDateLong,
  getTaskOccurrenceTimestamp,
  isTaskCompletedOnDate,
  isTaskOverdueTodayOrPast,
  toLocalDateStr,
} from '../utils/dateUz';
import { normalizeUzbek } from '../utils/uzbekNormalize';
import { CircularProgress } from './CircularProgress';
import { TaskRow } from './TaskRow';

interface DashboardViewProps {
  userName: string;
  tasks: Task[];
  onToggleComplete: (task: Task, dateStr: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveOverdueToTomorrow: (items: Array<{ task: Task; overdueDate: string }>) => void;
  onOpenNewTask: () => void;
}

export function DashboardView({
  userName,
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onMoveOverdueToTomorrow,
  onOpenNewTask,
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const todayStr = toLocalDateStr(now);

  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => doesTaskOccurOnDate(t, todayStr))
      .sort((a, b) => (a.vaqt || '00:00').localeCompare(b.vaqt || '00:00'));
  }, [tasks, todayStr]);

  const overdueItems = useMemo(() => {
    const list: Array<{ task: Task; overdueDate: string }> = [];
    for (const task of tasks) {
      const check = isTaskOverdueTodayOrPast(task, now);
      if (check.overdue && check.overdueDate) {
        list.push({ task, overdueDate: check.overdueDate });
      }
    }
    return list.sort((a, b) => {
      const cmpDate = a.overdueDate.localeCompare(b.overdueDate);
      if (cmpDate !== 0) return cmpDate;
      return (a.task.vaqt || '00:00').localeCompare(b.task.vaqt || '00:00');
    });
  }, [tasks, now]);

  const completedTodayCount = useMemo(
    () => todayTasks.filter((t) => isTaskCompletedOnDate(t, todayStr)).length,
    [todayTasks, todayStr],
  );

  const completionPercent =
    todayTasks.length > 0 ? Math.round((completedTodayCount / todayTasks.length) * 100) : 0;

  const nextTaskInfo = useMemo(() => {
    const nowMs = now.getTime();
    let closest: { task: Task; diffMs: number } | null = null;

    for (const task of todayTasks) {
      if (isTaskCompletedOnDate(task, todayStr)) continue;
      if (!task.vaqt) continue;
      const targetMs = getTaskOccurrenceTimestamp(todayStr, task.vaqt);
      const diffMs = targetMs - nowMs;
      if (diffMs >= 0 && (!closest || diffMs < closest.diffMs)) {
        closest = { task, diffMs };
      }
    }
    return closest;
  }, [todayTasks, todayStr, now]);

  const filteredTodayTasks = useMemo(() => {
    const q = normalizeUzbek(searchQuery);
    if (!q) return todayTasks;
    return todayTasks.filter((t) => normalizeUzbek(t.nomi).includes(q));
  }, [todayTasks, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/80">
            {formatUzDateLong(todayStr)}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5 text-balance">
            Salom, {userName}
          </h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 text-slate-500 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ish nomi bo‘yicha qidirish..."
            className="w-full h-11 pl-10 pr-3.5 rounded-2xl glass-surface text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60"
          />
        </div>
      </div>

      {/* Summary Grid: Circular Progress + Next Task Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="glass-surface rounded-3xl p-5 sm:p-6">
          <CircularProgress
            percentage={completionPercent}
            completed={completedTodayCount}
            total={todayTasks.length}
          />
        </section>

        <section className="glass-surface rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Keyingi ishgacha qolgan vaqt
            </span>
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-300 shrink-0" aria-hidden="true" />
          </div>

          {nextTaskInfo ? (
            <div className="mt-3">
              <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {formatCountdownUz(nextTaskInfo.diffMs)}
              </div>
              <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2 min-w-0">
                <span className="font-mono-tabular font-semibold text-indigo-600 dark:text-indigo-300 shrink-0">
                  {nextTaskInfo.task.vaqt}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate font-medium">{nextTaskInfo.task.nomi}</span>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                Rejalashtirilgan navbatdagi ish yo‘q
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Bugungi qolgan vaqtingiz uchun yangi ish qo‘shishingiz mumkin.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Overdue Section ('Muddati o'tgan') */}
      {overdueItems.length > 0 && (
        <section className="glass-surface rounded-3xl p-5 sm:p-6 border-rose-500/35">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <h2 className="font-display text-lg font-bold text-rose-700 dark:text-rose-300">
                Muddati o‘tgan ({overdueItems.length})
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onMoveOverdueToTomorrow(overdueItems)}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Hammasini ertaga ko‘chirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {overdueItems.map(({ task, overdueDate }) => (
              <TaskRow
                key={`overdue-${task.id}-${overdueDate}`}
                task={task}
                occurrenceDate={overdueDate}
                completed={false}
                isOverdue
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onMoveToTomorrow={(t, dt) => onMoveOverdueToTomorrow([{ task: t, overdueDate: dt }])}
              />
            ))}
          </div>
        </section>
      )}

      {/* Today's Tasks List */}
      <section className="glass-surface rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Bugungi ishlar
          </h2>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {filteredTodayTasks.length} ta
          </span>
        </div>

        {filteredTodayTasks.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {searchQuery
                ? 'Qidiruv bo‘yicha mos ish topilmadi.'
                : 'Bugun uchun hali ishlar qo‘shilmagan.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={onOpenNewTask}
                className="mt-4 min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Birinchi ishni qo‘shish</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTodayTasks.map((task) => {
              const completed = isTaskCompletedOnDate(task, todayStr);
              const overdueCheck = isTaskOverdueTodayOrPast(task, now);
              return (
                <TaskRow
                  key={task.id}
                  task={task}
                  occurrenceDate={todayStr}
                  completed={completed}
                  isOverdue={overdueCheck.overdue && overdueCheck.overdueDate === todayStr}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onMoveToTomorrow={(t, dt) => onMoveOverdueToTomorrow([{ task: t, overdueDate: dt }])}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
