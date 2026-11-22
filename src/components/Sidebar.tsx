import {
  Calendar,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Moon,
  Settings,
  Sun,
  Volume2,
} from 'lucide-react';
import type { AppView, ThemeMode } from '../types/task';

interface SidebarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  userName: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  audioUnlocked: boolean;
  onUnlockAudio: () => void;
  overdueCount: number;
}

const NAV_ITEMS: Array<{ id: AppView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
  { id: 'today', label: 'Bugun', icon: CheckSquare },
  { id: 'week', label: 'Hafta', icon: CalendarDays },
  { id: 'month', label: 'Oy', icon: Calendar },
  { id: 'settings', label: 'Sozlamalar', icon: Settings },
];

export function Sidebar({
  activeView,
  onChangeView,
  userName,
  theme,
  onToggleTheme,
  audioUnlocked,
  onUnlockAudio,
  overdueCount,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] glass-surface rounded-3xl p-4 justify-between">
        <div>
          <div className="px-3 pt-2 pb-5 flex items-center justify-between gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              mylife
            </span>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Kunduzgi rejimga o‘tish' : 'Tungi rejimga o‘tish'}
              title={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}
              className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <nav className="space-y-1" aria-label="Asosiy menyu">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeView(item.id)}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.id === 'today' && overdueCount > 0 && (
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        isActive ? 'text-white/90' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {overdueCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
          {!audioUnlocked && (
            <button
              type="button"
              onClick={onUnlockAudio}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Volume2 className="w-4 h-4 shrink-0" />
              <span>Ovozni yoqish</span>
            </button>
          )}

          <div className="px-3 py-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">Foydalanuvchi</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">
              {userName}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Fixed Bottom Navigation Bar (<= 15% height cap) */}
      <nav
        aria-label="Mobil menyu"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 glass-panel border-t border-slate-200/80 dark:border-white/15 px-1"
      >
        <div className="grid grid-cols-5 h-full max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors cursor-pointer relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.id === 'today' && overdueCount > 0 && (
                    <span className="absolute -top-1 -right-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      {overdueCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-none whitespace-nowrap truncate max-w-[68px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
