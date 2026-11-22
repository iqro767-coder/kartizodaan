import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  Moon,
  Music,
  Play,
  Square,
  Sun,
  User,
  Volume2,
} from 'lucide-react';
import type { ThemeMode } from '../types/task';
import { BUILTIN_TRACKS, musicEngine } from '../utils/musicEngine';

interface SettingsViewProps {
  userName: string;
  onSaveName: (newName: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  volume: number;
  onChangeVolume: (v: number) => void;
  audioUnlocked: boolean;
  onUnlockAudio: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestNotificationPermission: () => void;
}

export function SettingsView({
  userName,
  onSaveName,
  theme,
  onToggleTheme,
  volume,
  onChangeVolume,
  audioUnlocked,
  onUnlockAudio,
  notificationPermission,
  onRequestNotificationPermission,
}: SettingsViewProps) {
  const [nameInput, setNameInput] = useState(userName);
  const [savedNotice, setSavedNotice] = useState(false);
  const [playingKey, setPlayingKey] = useState<string | null>(musicEngine.getPlayingKey());

  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  useEffect(() => {
    return musicEngine.subscribe(() => {
      setPlayingKey(musicEngine.getPlayingKey());
    });
  }, []);

  const handleSaveName = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    onSaveName(trimmed);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2200);
  };

  const handleToggleTrack = async (trackId: string) => {
    const key = `settings_${trackId}`;
    if (playingKey === key) {
      musicEngine.stop();
      return;
    }
    const track = BUILTIN_TRACKS.find((t) => t.id === trackId);
    if (!track) return;
    await musicEngine.unlock();
    await musicEngine.playTrack(track, key, false);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-white/80">Ilova boshqaruvi</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
          Sozlamalar
        </h1>
      </div>

      {/* Warning Notice */}
      <div className="glass-surface rounded-2xl p-4 border-amber-500/40 bg-amber-500/15 dark:bg-amber-500/15 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
          Eslatmalar ishlashi uchun ilova brauzerda ochiq turishi kerak.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User Name */}
        <section className="glass-surface rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Foydalanuvchi ismi
            </h2>
          </div>

          <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={nameInput}
              maxLength={40}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ismingiz"
              className="flex-1 h-11 px-3.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {savedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saqlandi</span>
                </>
              ) : (
                <span>O‘zgartirish</span>
              )}
            </button>
          </form>
        </section>

        {/* Theme Switch */}
        <section className="glass-surface rounded-3xl p-5 sm:p-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Ko‘rinish rejimi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Hozirgi rejim: {theme === 'dark' ? 'Tungi rejim' : 'Kunduzgi rejim'}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4" />
                <span>Kunduzgi rejim</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>Tungi rejim</span>
              </>
            )}
          </button>
        </section>

        {/* Browser Notifications */}
        <section className="glass-surface rounded-3xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Brauzer bildirishnomasi
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Ruxsat berilsa, ilova boshqa oynada ochiq turganida ham eslatma bildirishnomasi keladi.
          </p>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Holat:{' '}
              {notificationPermission === 'granted'
                ? 'Ruxsat berilgan'
                : notificationPermission === 'denied'
                  ? 'Rad etilgan (brauzer sozlamasidan yoqing)'
                  : notificationPermission === 'unsupported'
                    ? 'Bu brauzerda qo‘llab-quvvatlanmaydi'
                    : 'So‘ralmagan'}
            </span>

            {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
              <button
                type="button"
                onClick={onRequestNotificationPermission}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Ruxsat berish
              </button>
            )}
          </div>
        </section>

        {/* Sound & Volume */}
        <section className="glass-surface rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Ovoz va musiqa
              </h2>
            </div>

            {!audioUnlocked ? (
              <button
                type="button"
                onClick={onUnlockAudio}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Ovozni yoqish
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Ovoz faol
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="settings-volume-slider"
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap"
            >
              Ovoz balandligi
            </label>
            <input
              id="settings-volume-slider"
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => onChangeVolume(Number(e.target.value) / 100)}
              className="flex-1 accent-indigo-600 cursor-pointer"
            />
            <span className="text-xs font-mono-tabular w-10 text-right text-slate-700 dark:text-slate-200">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </section>
      </div>

      {/* Built-in Music Catalog Preview */}
      <section className="glass-surface rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Music className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Ilova kuylari ro‘yxati
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {BUILTIN_TRACKS.length} ta kuy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {BUILTIN_TRACKS.map((track) => {
            const isPlaying = playingKey === `settings_${track.id}`;
            return (
              <div
                key={track.id}
                className="rounded-2xl p-3 bg-white/60 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {track.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {track.category} · {track.moodLabel}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleTrack(track.id)}
                  aria-label={isPlaying ? `${track.title}ni to‘xtatish` : `${track.title}ni tinglash`}
                  className={`min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    isPlaying
                      ? 'bg-rose-600 text-white'
                      : 'bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600/25'
                  }`}
                >
                  {isPlaying ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
