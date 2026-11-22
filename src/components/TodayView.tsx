import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Plus, Search } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import type { CategoryId, Task } from '../types/task';
import {
  doesTaskOccurOnDate,
  formatUzDateLong,
  isTaskCompletedOnDate,
  isTaskOverdueTodayOrPast,
  toLocalDateStr,
} from '../utils/dateUz';
import { normalizeUzbek } from '../utils/uzbekNormalize';
import { TaskRow } from './TaskRow';

interface TodayViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task, dateStr: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveOverdueToTomorrow: (items: Array<{ task: Task; overdueDate: string }>) => void;
  onOpenNewTask: () => void;
}

export function TodayView({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onMoveOverdueToTomorrow,
  onOpenNewTask,
}: TodayViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'done'>('all');

  const now = new Date();
  const todayStr = toLocalDateStr(now);

  const overdueItems = useMemo(() => {
    const q = normalizeUzbek(searchQuery);
    const list: Array<{ task: Task; overdueDate: string }> = [];
    for (const task of tasks) {
      if (selectedCategory !== 'all' && task.toifa !== selectedCategory) continue;
      if (q && !normalizeUzbek(task.nomi).includes(q)) continue;
      const check = isTaskOverdueTodayOrPast(task, now);
      if (check.overdue && check.overdueDate) {
        list.push({ task, overdueDate: check.overdueDate });
      }
    }
    return list.sort((a, b) => (a.task.vaqt || '00:00').localeCompare(b.task.vaqt || '00:00'));
  }, [tasks, selectedCategory, searchQuery, now]);

  const filteredTasks = useMemo(() => {
    const q = normalizeUzbek(searchQuery);
    return tasks
      .filter((t) => doesTaskOccurOnDate(t, todayStr))
      .filter((t) => selectedCategory === 'all' || t.toifa === selectedCategory)
      .filter((t) => !q || normalizeUzbek(t.nomi).includes(q))
      .filter((t) => {
        const done = isTaskCompletedOnDate(t, todayStr);
        if (statusFilter === 'active') return !done;
        if (statusFilter === 'done') return done;
        return true;
      })
      .sort((a, b) => (a.vaqt || '00:00').localeCompare(b.vaqt || '00:00'));
  }, [tasks, todayStr, selectedCategory, searchQuery, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/80">{formatUzDateLong(todayStr)}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
            Bugungi ishlar
          </h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ish nomi bo‘yicha qidirish..."
            className="w-full h-11 pl-10 pr-3.5 rounded-2xl glass-surface text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60"
          />
        </div>
      </div>

      {/* Category & Status Filters */}
      <div className="glass-surface rounded-3xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-white/10'
            }`}
          >
            Barchasi
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/5 dark:bg-white/[0.06] w-fit">
          {([
            { id: 'all', label: 'Hammasi' },
            { id: 'active', label: 'Bajarilmagan' },
            { id: 'done', label: 'Bajarilgan' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overdue Section */}
      {statusFilter !== 'done' && overdueItems.length > 0 && (
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
              className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Hammasini ertaga ko‘chirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {overdueItems.map(({ task, overdueDate }) => (
              <TaskRow
                key={`today-overdue-${task.id}-${overdueDate}`}
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

      {/* Main Today List */}
      <section className="glass-surface rounded-3xl p-5 sm:p-6">
        {filteredTasks.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Tanlangan shartlar bo‘yicha ishlar topilmadi.
            </p>
            <button
              type="button"
              onClick={onOpenNewTask}
              className="mt-4 min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi ish qo‘shish</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => {
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
