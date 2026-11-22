import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Moon, Plus, Sun, Volume2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { DashboardView } from './components/DashboardView';
import { MonthView } from './components/MonthView';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ReminderModal } from './components/ReminderModal';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { TodayView } from './components/TodayView';
import { WeekView } from './components/WeekView';
import { WelcomeSplash } from './components/WelcomeSplash';
import type {
  ActiveReminder,
  AppView,
  SnoozedReminder,
  Task,
  ThemeMode,
  UserHistoryItem,
} from './types/task';
import {
  addDays,
  doesTaskOccurOnDate,
  isTaskCompletedOnDate,
  isTaskOverdueTodayOrPast,
  toLocalDateStr,
  toLocalTimeStr,
} from './utils/dateUz';
import { musicEngine } from './utils/musicEngine';
import {
  getInitialTheme,
  getStoredHistory,
  getStoredTasks,
  getStoredUserName,
  getStoredVolume,
  recordUserTaskHistory,
  saveTasks,
  saveTheme,
  saveUserName,
  saveVolume,
} from './utils/storage';

export default function App() {
  const [userName, setUserName] = useState<string | null>(() => getStoredUserName());
  const [showSplash, setShowSplash] = useState<boolean>(() => Boolean(getStoredUserName()));
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  const [tasks, setTasks] = useState<Task[]>(() => getStoredTasks());
  const [userHistory, setUserHistory] = useState<UserHistoryItem[]>(() => getStoredHistory());
  const [volume, setVolume] = useState<number>(() => {
    const v = getStoredVolume();
    musicEngine.setVolume(v);
    return v;
  });

  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  const [audioPromptDismissed, setAudioPromptDismissed] = useState<boolean>(false);

  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  });
  const [notifBannerDismissed, setNotifBannerDismissed] = useState<boolean>(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const [snoozedReminders, setSnoozedReminders] = useState<SnoozedReminder[]>([]);
  const [playingKey, setPlayingKey] = useState<string | null>(musicEngine.getPlayingKey());

  const triggeredKeysRef = useRef<Set<string>>(new Set());

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Persist tasks
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Subscribe to music engine playback state
  useEffect(() => {
    return musicEngine.subscribe(() => {
      setPlayingKey(musicEngine.getPlayingKey());
      if (musicEngine.isUnlocked()) {
        setAudioUnlocked(true);
      }
    });
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleOnboardingSubmit = useCallback((name: string) => {
    saveUserName(name);
    setUserName(name);
    setShowSplash(true);
  }, []);

  const handleChangeName = useCallback((newName: string) => {
    saveUserName(newName);
    setUserName(newName);
  }, []);

  const handleChangeVolume = useCallback((v: number) => {
    setVolume(v);
    saveVolume(v);
    musicEngine.setVolume(v);
  }, []);

  const handleUnlockAudio = useCallback(async () => {
    const ok = await musicEngine.unlock();
    setAudioUnlocked(ok || true);
    setAudioPromptDismissed(true);
  }, []);

  const handleRequestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const res = await Notification.requestPermission();
      setNotificationPermission(res);
      if (res !== 'default') {
        setNotifBannerDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const triggerReminderForTask = useCallback(
    (task: Task, occurrenceDate: string, snoozed = false) => {
      setActiveReminder({
        taskId: task.id,
        occurrenceDate,
        triggeredAt: Date.now(),
        snoozed,
      });

      // Play task music
      musicEngine.playForTask(task.toifa, task.musiqa, `reminder_${task.id}`, true);

      // Browser notification (works even if user switched to another tab)
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(`mylife — ${task.nomi}`, {
            body: `${task.toifa} · ${task.vaqt || 'Hozir'}${task.izoh ? ` — ${task.izoh}` : ''}`,
            tag: `mylife-task-${task.id}`,
          });
        } catch {
          // ignore notification failure
        }
      }
    },
    [],
  );

  // Background reminder watcher (runs every second while app is open)
  useEffect(() => {
    if (!userName || showSplash) return;

    const checkReminders = () => {
      const now = new Date();
      const nowMs = now.getTime();
      const todayStr = toLocalDateStr(now);
      const nowTime = toLocalTimeStr(now);

      // 1. Check snoozed reminders
      setSnoozedReminders((prev) => {
        if (prev.length === 0) return prev;
        const due = prev.find((s) => nowMs >= s.triggerAtMs);
        if (!due) return prev;

        const targetTask = tasks.find((t) => t.id === due.taskId);
        if (targetTask && !isTaskCompletedOnDate(targetTask, due.occurrenceDate)) {
          triggerReminderForTask(targetTask, due.occurrenceDate, true);
        }
        return prev.filter((s) => s !== due);
      });

      // 2. Check scheduled tasks for current HH:mm
      if (activeReminder) return;

      for (const task of tasks) {
        if (!task.vaqt) continue;
        if (!doesTaskOccurOnDate(task, todayStr)) continue;
        if (isTaskCompletedOnDate(task, todayStr)) continue;
        if (task.vaqt === nowTime) {
          const triggerKey = `${task.id}_${todayStr}_${task.vaqt}`;
          if (!triggeredKeysRef.current.has(triggerKey)) {
            triggeredKeysRef.current.add(triggerKey);
            triggerReminderForTask(task, todayStr, false);
            break;
          }
        }
      }
    };

    checkReminders();
    const timer = window.setInterval(checkReminders, 1000);
    return () => window.clearInterval(timer);
  }, [userName, showSplash, tasks, activeReminder, triggerReminderForTask]);

  const handleToggleComplete = useCallback((task: Task, dateStr: string) => {
    setTasks((prev) =>
      prev.map((item) => {
        if (item.id !== task.id) return item;
        if (item.takrorlanish === 'bir_martalik') {
          return { ...item, bajarildi: !item.bajarildi };
        }
        const existing = item.bajarilganSanalar || [];
        const hasDate = existing.includes(dateStr);
        return {
          ...item,
          bajarilganSanalar: hasDate
            ? existing.filter((d) => d !== dateStr)
            : [...existing, dateStr],
        };
      }),
    );
  }, []);

  const handleSaveTask = useCallback(
    (
      taskData: Omit<Task, 'id' | 'createdAt' | 'bajarildi'> & {
        id?: string;
        bajarildi?: boolean;
      },
    ) => {
      if (taskData.id) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskData.id
              ? {
                  ...t,
                  ...taskData,
                  id: t.id,
                  createdAt: t.createdAt,
                  bajarildi: taskData.bajarildi ?? t.bajarildi,
                }
              : t,
          ),
        );
      } else {
        const newTask: Task = {
          ...taskData,
          id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          bajarildi: false,
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [newTask, ...prev]);
      }

      const updatedHistory = recordUserTaskHistory(taskData.nomi, taskData.toifa);
      setUserHistory(updatedHistory);
      setIsTaskModalOpen(false);
      setEditingTask(null);
      setModalDefaultDate(undefined);
    },
    [],
  );

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const handleMoveOverdueToTomorrow = useCallback(
    (items: Array<{ task: Task; overdueDate: string }>) => {
      if (items.length === 0) return;
      const tomorrowStr = addDays(toLocalDateStr(), 1);
      const mapByTaskId = new Map<string, string[]>();
      for (const item of items) {
        const arr = mapByTaskId.get(item.task.id) || [];
        arr.push(item.overdueDate);
        mapByTaskId.set(item.task.id, arr);
      }

      setTasks((prev) =>
        prev.map((task) => {
          const overdueDates = mapByTaskId.get(task.id);
          if (!overdueDates) return task;

          if (task.takrorlanish === 'bir_martalik') {
            return { ...task, sana: tomorrowStr };
          }

          const skipped = Array.from(
            new Set([...(task.otkazilganSanalar || []), ...overdueDates]),
          );
          const extra = Array.from(
            new Set([...(task.qoshimchaSanalar || []), tomorrowStr]),
          );
          return {
            ...task,
            otkazilganSanalar: skipped,
            qoshimchaSanalar: extra,
          };
        }),
      );
    },
    [],
  );

  const overdueCount = useMemo(() => {
    const now = new Date();
    return tasks.filter((t) => isTaskOverdueTodayOrPast(t, now).overdue).length;
  }, [tasks]);

  const activeReminderTask = useMemo(() => {
    if (!activeReminder) return null;
    return tasks.find((t) => t.id === activeReminder.taskId) || null;
  }, [activeReminder, tasks]);

  const handleReminderComplete = useCallback(() => {
    if (!activeReminder || !activeReminderTask) return;
    musicEngine.stop();
    if (!isTaskCompletedOnDate(activeReminderTask, activeReminder.occurrenceDate)) {
      handleToggleComplete(activeReminderTask, activeReminder.occurrenceDate);
    }
    setActiveReminder(null);
  }, [activeReminder, activeReminderTask, handleToggleComplete]);

  const handleReminderSnooze = useCallback(
    (minutes: 5 | 10 | 15) => {
      if (!activeReminder) return;
      musicEngine.stop();
      setSnoozedReminders((prev) => [
        ...prev,
        {
          taskId: activeReminder.taskId,
          occurrenceDate: activeReminder.occurrenceDate,
          triggerAtMs: Date.now() + minutes * 60 * 1000,
        },
      ]);
      setActiveReminder(null);
    },
    [activeReminder],
  );

  const handleReminderDismiss = useCallback(() => {
    musicEngine.stop();
    setActiveReminder(null);
  }, []);

  if (!userName) {
    return <OnboardingScreen onSubmitName={handleOnboardingSubmit} />;
  }

  if (showSplash) {
    return <WelcomeSplash userName={userName} onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 flex flex-col lg:flex-row gap-5">
        <Sidebar
          activeView={activeView}
          onChangeView={setActiveView}
          userName={userName}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          audioUnlocked={audioUnlocked}
          onUnlockAudio={handleUnlockAudio}
          overdueCount={overdueCount}
        />

        <main className="flex-1 min-w-0">
          {/* Mobile Compact Top Header */}
          <header className="lg:hidden flex items-center justify-between gap-4 mb-4 px-1">
            <span className="font-display text-xl font-bold tracking-tight text-white">
              mylife
            </span>
            <div className="flex items-center gap-2">
              {!audioUnlocked && (
                <button
                  type="button"
                  onClick={handleUnlockAudio}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Ovozni yoqish</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleTheme}
                aria-label={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}
                className="min-w-[44px] min-h-[44px] rounded-xl glass-surface flex items-center justify-center text-slate-900 dark:text-white cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* One-time Audio & Notification Permission Prompts */}
          <div className="space-y-2.5 mb-5">
            {!audioUnlocked && !audioPromptDismissed && (
              <div className="hidden lg:flex glass-surface rounded-2xl px-4 py-3 items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Volume2 className="w-5 h-5 text-amber-600 dark:text-amber-300 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                    Eslatma vaqtida musiqa chalishi uchun ovozga bir marta ruxsat bering.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUnlockAudio}
                  className="min-h-[40px] px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Ovozni yoqish
                </button>
              </div>
            )}

            {notificationPermission === 'default' && !notifBannerDismissed && (
              <div className="glass-surface rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-300 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                    Ilova boshqa oynada ochiq turganida ham eslatma olish uchun brauzer bildirishnomasini yoqing.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setNotifBannerDismissed(true)}
                    className="min-h-[38px] px-3 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/10 cursor-pointer whitespace-nowrap"
                  >
                    Keyinroq
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestNotificationPermission}
                    className="min-h-[38px] px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Bildirishnomani yoqish
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active View */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeView === 'dashboard' && (
                <DashboardView
                  userName={userName}
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={(t) => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onMoveOverdueToTomorrow={handleMoveOverdueToTomorrow}
                  onOpenNewTask={() => {
                    setEditingTask(null);
                    setModalDefaultDate(undefined);
                    setIsTaskModalOpen(true);
                  }}
                />
              )}

              {activeView === 'today' && (
                <TodayView
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={(t) => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onMoveOverdueToTomorrow={handleMoveOverdueToTomorrow}
                  onOpenNewTask={() => {
                    setEditingTask(null);
                    setModalDefaultDate(undefined);
                    setIsTaskModalOpen(true);
                  }}
                />
              )}

              {activeView === 'week' && (
                <WeekView
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={(t) => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onOpenNewTaskForDate={(dateStr) => {
                    setEditingTask(null);
                    setModalDefaultDate(dateStr);
                    setIsTaskModalOpen(true);
                  }}
                />
              )}

              {activeView === 'month' && (
                <MonthView
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={(t) => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onOpenNewTaskForDate={(dateStr) => {
                    setEditingTask(null);
                    setModalDefaultDate(dateStr);
                    setIsTaskModalOpen(true);
                  }}
                />
              )}

              {activeView === 'settings' && (
                <SettingsView
                  userName={userName}
                  onSaveName={handleChangeName}
                  theme={theme}
                  onToggleTheme={handleToggleTheme}
                  volume={volume}
                  onChangeVolume={handleChangeVolume}
                  audioUnlocked={audioUnlocked}
                  onUnlockAudio={handleUnlockAudio}
                  notificationPermission={notificationPermission}
                  onRequestNotificationPermission={handleRequestNotificationPermission}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent Floating '+' Button */}
      <button
        type="button"
        onClick={() => {
          setEditingTask(null);
          setModalDefaultDate(undefined);
          setIsTaskModalOpen(true);
        }}
        aria-label="Yangi ish qo‘shish"
        title="Yangi ish qo‘shish"
        className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-indigo-950/35 transition-all cursor-pointer"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        editingTask={editingTask}
        defaultDate={modalDefaultDate}
        userHistory={userHistory}
        volume={volume}
        onChangeVolume={handleChangeVolume}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setModalDefaultDate(undefined);
        }}
        onSave={handleSaveTask}
      />

      {/* Fullscreen Task Reminder Modal */}
      <ReminderModal
        task={activeReminderTask}
        occurrenceDate={activeReminder?.occurrenceDate || toLocalDateStr()}
        isMusicPlaying={Boolean(playingKey && playingKey.startsWith('reminder_'))}
        onComplete={handleReminderComplete}
        onSnooze={handleReminderSnooze}
        onStopMusic={() => musicEngine.stop()}
        onDismiss={handleReminderDismiss}
      />
    </div>
  );
}
