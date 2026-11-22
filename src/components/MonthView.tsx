import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CATEGORY_MAP } from '../constants/categories';
import type { Task } from '../types/task';
import {
  doesTaskOccurOnDate,
  formatUzDateLong,
  getMonthCalendarCells,
  isTaskCompletedOnDate,
  parseLocalDate,
  toLocalDateStr,
  UZ_MONTHS,
  UZ_WEEKDAYS_SHORT,
} from '../utils/dateUz';
import { TaskRow } from './TaskRow';

interface MonthViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task, dateStr: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskForDate: (dateStr: string) => void;
}

export function MonthView({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskForDate,
}: MonthViewProps) {
  const todayStr = toLocalDateStr();
  const todayDate = parseLocalDate(todayStr);

  const [cursorYear, setCursorYear] = useState(todayDate.getFullYear());
  const [cursorMonth, setCursorMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const cells = useMemo(
    () => getMonthCalendarCells(cursorYear, cursorMonth),
    [cursorYear, cursorMonth],
  );

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const cell of cells) {
      map[cell.dateStr] = tasks
        .filter((t) => doesTaskOccurOnDate(t, cell.dateStr))
        .sort((a, b) => (a.vaqt || '00:00').localeCompare(b.vaqt || '00:00'));
    }
    return map;
  }, [cells, tasks]);

  const handlePrevMonth = () => {
    if (cursorMonth === 0) {
      setCursorYear((y) => y - 1);
      setCursorMonth(11);
    } else {
      setCursorMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (cursorMonth === 11) {
      setCursorYear((y) => y + 1);
      setCursorMonth(0);
    } else {
      setCursorMonth((m) => m + 1);
    }
  };

  const selectedDayTasks = useMemo(
    () =>
      tasks
        .filter((t) => doesTaskOccurOnDate(t, selectedDate))
        .sort((a, b) => (a.vaqt || '00:00').localeCompare(b.vaqt || '00:00')),
    [tasks, selectedDate],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/80">Oylik taqvim</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5 tabular-nums">
            {UZ_MONTHS[cursorMonth]} {cursorYear}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Oldingi oy"
            className="min-w-[44px] min-h-[44px] rounded-xl glass-surface flex items-center justify-center text-slate-800 dark:text-white cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setCursorYear(now.getFullYear());
              setCursorMonth(now.getMonth());
              setSelectedDate(toLocalDateStr(now));
            }}
            className="min-h-[44px] px-4 rounded-xl glass-surface text-xs sm:text-sm font-semibold text-slate-900 dark:text-white cursor-pointer whitespace-nowrap"
          >
            Bugun
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Keyingi oy"
            className="min-w-[44px] min-h-[44px] rounded-xl glass-surface flex items-center justify-center text-slate-800 dark:text-white cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <section className="glass-surface rounded-3xl p-3.5 sm:p-5">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {UZ_WEEKDAYS_SHORT.map((dayName) => (
            <div
              key={dayName}
              className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-1.5"
            >
              {dayName}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {cells.map(({ dateStr, inCurrentMonth }) => {
            const dayTasks = tasksByDate[dateStr] || [];
            const dayNum = Number(dateStr.split('-')[2]);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-[60px] sm:min-h-[78px] p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25'
                    : isToday
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-slate-900 dark:text-white'
                      : inCurrentMonth
                        ? 'bg-white/60 dark:bg-white/[0.05] border-slate-200/70 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white/90 dark:hover:bg-white/10'
                        : 'bg-white/25 dark:bg-white/[0.02] border-transparent text-slate-400 dark:text-slate-500'
                }`}
              >
                <span className="text-xs sm:text-sm font-mono-tabular font-semibold">
                  {dayNum}
                </span>

                {dayTasks.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    {dayTasks.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: isSelected
                            ? '#ffffff'
                            : CATEGORY_MAP[t.toifa].color,
                        }}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span
                        className={`text-[10px] font-mono-tabular font-semibold ${
                          isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        +{dayTasks.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Day Tasks Panel */}
      <section className="glass-surface rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {formatUzDateLong(selectedDate)}
          </h2>
          <button
            type="button"
            onClick={() => onOpenNewTaskForDate(selectedDate)}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Shu kunga qo‘shish</span>
          </button>
        </div>

        {selectedDayTasks.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300 py-4 text-center">
            Tanlangan sana uchun ishlar rejalashtirilmagan.
          </p>
        ) : (
          <div className="space-y-2.5">
            {selectedDayTasks.map((task) => (
              <TaskRow
                key={`${selectedDate}-${task.id}`}
                task={task}
                occurrenceDate={selectedDate}
                completed={isTaskCompletedOnDate(task, selectedDate)}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
