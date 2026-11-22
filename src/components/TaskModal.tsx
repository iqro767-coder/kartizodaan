import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import {
  History,
  Music,
  Play,
  Square,
  Upload,
  Volume2,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  CATEGORIES,
  CATEGORY_MAP,
  PRIORITY_LABELS,
  RECURRENCE_LABELS,
} from '../constants/categories';
import { getSmartSuggestions, type SuggestionItem } from '../data/suggestions';
import type {
  CategoryId,
  MusicMode,
  PriorityLevel,
  RecurrenceType,
  Task,
  UserHistoryItem,
} from '../types/task';
import { listCustomAudios, saveCustomAudio } from '../utils/audioStorage';
import { toLocalDateStr, UZ_WEEKDAYS_SHORT } from '../utils/dateUz';
import {
  BUILTIN_TRACKS,
  getAutoTrackForCategory,
  musicEngine,
} from '../utils/musicEngine';
import { CategoryIcon } from './CategoryIcon';

interface TaskModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  defaultDate?: string;
  userHistory: UserHistoryItem[];
  volume: number;
  onChangeVolume: (v: number) => void;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'bajarildi'> & { id?: string; bajarildi?: boolean }) => void;
}

export function TaskModal({
  isOpen,
  editingTask,
  defaultDate,
  userHistory,
  volume,
  onChangeVolume,
  onClose,
  onSave,
}: TaskModalProps) {
  const [nomi, setNomi] = useState('');
  const [izoh, setIzoh] = useState('');
  const [sana, setSana] = useState(defaultDate || toLocalDateStr());
  const [vaqt, setVaqt] = useState('09:00');
  const [toifa, setToifa] = useState<CategoryId>('Ish');
  const [muhimlik, setMuhimlik] = useState<PriorityLevel>("o'rta");
  const [takrorlanish, setTakrorlanish] = useState<RecurrenceType>('bir_martalik');
  const [haftaKunlari, setHaftaKunlari] = useState<number[]>([1, 2, 3, 4, 5]);
  const [oySanasi, setOySanasi] = useState<number>(new Date().getDate());

  const [musicMode, setMusicMode] = useState<MusicMode>('auto');
  const [presetId, setPresetId] = useState<string>(BUILTIN_TRACKS[0].id);
  const [customAudioId, setCustomAudioId] = useState<string | undefined>(undefined);
  const [customAudioName, setCustomAudioName] = useState<string | undefined>(undefined);
  const [savedCustomAudios, setSavedCustomAudios] = useState<Array<{ id: string; name: string }>>([]);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [playingKey, setPlayingKey] = useState<string | null>(musicEngine.getPlayingKey());

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return musicEngine.subscribe(() => {
      setPlayingKey(musicEngine.getPlayingKey());
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    listCustomAudios().then((list) => {
      setSavedCustomAudios(list.map((i) => ({ id: i.id, name: i.name })));
    });

    if (editingTask) {
      setNomi(editingTask.nomi);
      setIzoh(editingTask.izoh);
      setSana(editingTask.sana);
      setVaqt(editingTask.vaqt || '09:00');
      setToifa(editingTask.toifa);
      setMuhimlik(editingTask.muhimlik);
      setTakrorlanish(editingTask.takrorlanish);
      setHaftaKunlari(editingTask.haftaKunlari?.length ? editingTask.haftaKunlari : [1, 2, 3, 4, 5]);
      setOySanasi(editingTask.oySanasi || new Date().getDate());
      setMusicMode(editingTask.musiqa?.mode || 'auto');
      setPresetId(editingTask.musiqa?.presetId || getAutoTrackForCategory(editingTask.toifa).id);
      setCustomAudioId(editingTask.musiqa?.customAudioId);
      setCustomAudioName(editingTask.musiqa?.customAudioName);
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15);
      const nextHH = String(now.getHours()).padStart(2, '0');
      const nextMM = String(now.getMinutes()).padStart(2, '0');

      setNomi('');
      setIzoh('');
      setSana(defaultDate || toLocalDateStr());
      setVaqt(`${nextHH}:${nextMM}`);
      setToifa('Ish');
      setMuhimlik("o'rta");
      setTakrorlanish('bir_martalik');
      setHaftaKunlari([1, 2, 3, 4, 5]);
      setOySanasi(new Date().getDate());
      setMusicMode('auto');
      setPresetId(getAutoTrackForCategory('Ish').id);
      setCustomAudioId(undefined);
      setCustomAudioName(undefined);
    }
    setError('');
    setShowSuggestions(false);
    setHighlightedIdx(-1);

    return () => {
      if (musicEngine.getPlayingKey() === 'task_modal_preview') {
        musicEngine.stop();
      }
    };
  }, [isOpen, editingTask, defaultDate]);

  const suggestions = useMemo(() => {
    if (!nomi.trim()) return [];
    return getSmartSuggestions(nomi, userHistory, 8);
  }, [nomi, userHistory]);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setNomi(item.nomi);
    setToifa(item.toifa);
    setShowSuggestions(false);
    setHighlightedIdx(-1);
    setError('');
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev + 1 >= suggestions.length ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && highlightedIdx >= 0 && suggestions[highlightedIdx]) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIdx(-1);
    }
  };

  const toggleWeekday = (isoDay: number) => {
    setHaftaKunlari((prev) => {
      if (prev.includes(isoDay)) {
        if (prev.length === 1) return prev; // Keep at least 1 day selected
        return prev.filter((d) => d !== isoDay);
      }
      return [...prev, isoDay].sort((a, b) => a - b);
    });
  };

  const handleAudioUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const saved = await saveCustomAudio(file);
      setCustomAudioId(saved.id);
      setCustomAudioName(saved.name);
      setMusicMode('custom');
      setSavedCustomAudios((prev) => [{ id: saved.id, name: saved.name }, ...prev]);
    } catch {
      setError('Audio faylni saqlashda xatolik yuz berdi');
    } finally {
      setUploadingAudio(false);
      e.target.value = '';
    }
  };

  const isPreviewPlaying = playingKey === 'task_modal_preview';

  const handleTogglePreview = async () => {
    if (isPreviewPlaying) {
      musicEngine.stop();
      return;
    }
    await musicEngine.unlock();
    await musicEngine.playForTask(
      toifa,
      {
        mode: musicMode,
        presetId,
        customAudioId,
        customAudioName,
      },
      'task_modal_preview',
      true,
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = nomi.trim();
    if (!cleanTitle) {
      setError('Ish nomini kiritish majburiy');
      inputRef.current?.focus();
      return;
    }

    if (musicMode === 'custom' && !customAudioId) {
      setError('Iltimos, qurilmangizdan audio fayl yuklang yoki boshqa musiqa turini tanlang');
      return;
    }

    if (isPreviewPlaying) {
      musicEngine.stop();
    }

    onSave({
      id: editingTask?.id,
      bajarildi: editingTask?.bajarildi ?? false,
      bajarilganSanalar: editingTask?.bajarilganSanalar,
      otkazilganSanalar: editingTask?.otkazilganSanalar,
      qoshimchaSanalar: editingTask?.qoshimchaSanalar,
      nomi: cleanTitle,
      izoh: izoh.trim(),
      sana,
      vaqt,
      toifa,
      muhimlik,
      takrorlanish,
      haftaKunlari: takrorlanish === 'hafta_kunlari' ? haftaKunlari : undefined,
      oySanasi: takrorlanish === 'oy_sanasi' ? oySanasi : undefined,
      musiqa: {
        mode: musicMode,
        presetId: musicMode === 'preset' ? presetId : undefined,
        customAudioId: musicMode === 'custom' ? customAudioId : undefined,
        customAudioName: musicMode === 'custom' ? customAudioName : undefined,
      },
    });
  };

  if (!isOpen) return null;

  const autoTrack = getAutoTrackForCategory(toifa);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          musicEngine.stop();
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full sm:max-w-xl max-h-[92vh] flex flex-col glass-panel rounded-t-3xl sm:rounded-3xl text-slate-900 dark:text-white overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <h2 id="task-modal-title" className="font-display text-lg sm:text-xl font-bold">
            {editingTask ? 'Ishni tahrirlash' : 'Yangi ish qo‘shish'}
          </h2>
          <button
            type="button"
            onClick={() => {
              musicEngine.stop();
              onClose();
            }}
            aria-label="Yopish"
            className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Task Name + Smart Suggestions */}
          <div className="relative">
            <label
              htmlFor="task-title-input"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
            >
              Ish nomi <span className="text-rose-500">*</span>
            </label>
            <input
              ref={inputRef}
              id="task-title-input"
              type="text"
              autoComplete="off"
              autoFocus
              value={nomi}
              onChange={(e) => {
                setNomi(e.target.value);
                setShowSuggestions(true);
                setHighlightedIdx(-1);
                if (error) setError('');
              }}
              onFocus={() => {
                if (nomi.trim()) setShowSuggestions(true);
              }}
              onBlur={() => {
                // Delay so click on suggestion registers before blur hides menu
                window.setTimeout(() => setShowSuggestions(false), 160);
              }}
              onKeyDown={handleTitleKeyDown}
              placeholder="Masalan: Ertalabki yugurish"
              className="w-full h-11 px-3.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Smart Autocomplete Dropdown (max 8 items) */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                role="listbox"
                aria-label="Aqlli maslahatlar"
                className="absolute left-0 right-0 top-full mt-1.5 z-30 glass-panel rounded-2xl overflow-hidden divide-y divide-slate-200/60 dark:divide-white/10 max-h-72 overflow-y-auto"
              >
                {suggestions.map((item, idx) => {
                  const cat = CATEGORY_MAP[item.toifa];
                  const active = idx === highlightedIdx;
                  return (
                    <button
                      key={`${item.nomi}-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion(item);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        active
                          ? 'bg-indigo-600/15 dark:bg-indigo-500/25'
                          : 'hover:bg-slate-900/5 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        {item.fromHistory ? (
                          <History className="w-4 h-4 text-indigo-500 shrink-0" />
                        ) : (
                          <span className={`${cat.textClass} shrink-0`}>
                            <CategoryIcon category={item.toifa} className="w-4 h-4" />
                          </span>
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {item.nomi}
                        </span>
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                        {item.fromHistory ? `Avvalgi · ${cat.label}` : cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {error && (
              <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="task-notes-input"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
            >
              Izoh
            </label>
            <textarea
              id="task-notes-input"
              rows={2}
              value={izoh}
              onChange={(e) => setIzoh(e.target.value)}
              placeholder="Qo‘shimcha ma’lumot yoki eslatma..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="task-date-input"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Sana
              </label>
              <input
                id="task-date-input"
                type="date"
                value={sana}
                onChange={(e) => setSana(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 text-sm font-mono-tabular text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="task-time-input"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Vaqt
              </label>
              <input
                id="task-time-input"
                type="time"
                value={vaqt}
                onChange={(e) => setVaqt(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 text-sm font-mono-tabular text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Toifa
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const selected = toifa === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setToifa(cat.id)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white/60 dark:bg-white/[0.06] border-slate-200 dark:border-white/12 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/10'
                    }`}
                  >
                    <CategoryIcon
                      category={cat.id}
                      className={`w-4 h-4 shrink-0 ${selected ? 'text-white' : cat.textClass}`}
                    />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Muhimlik
            </span>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-900/5 dark:bg-white/[0.06]">
              {(['past', "o'rta", 'yuqori'] as PriorityLevel[]).map((lvl) => {
                const selected = muhimlik === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setMuhimlik(lvl)}
                    className={`min-h-[40px] rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      selected
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {PRIORITY_LABELS[lvl]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label
              htmlFor="task-recurrence-select"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
            >
              Takrorlanish
            </label>
            <select
              id="task-recurrence-select"
              value={takrorlanish}
              onChange={(e) => setTakrorlanish(e.target.value as RecurrenceType)}
              className="w-full h-11 px-3.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {(Object.keys(RECURRENCE_LABELS) as RecurrenceType[]).map((key) => (
                <option key={key} value={key}>
                  {RECURRENCE_LABELS[key]}
                </option>
              ))}
            </select>

            {takrorlanish === 'hafta_kunlari' && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {UZ_WEEKDAYS_SHORT.map((label, idx) => {
                  const isoDay = idx + 1;
                  const active = haftaKunlari.includes(isoDay);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleWeekday(isoDay)}
                      className={`min-w-[44px] min-h-[40px] px-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white/60 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/12'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {takrorlanish === 'oy_sanasi' && (
              <div className="mt-2.5 flex items-center gap-3">
                <label
                  htmlFor="month-day-input"
                  className="text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Oyning sanasi (1–31):
                </label>
                <input
                  id="month-day-input"
                  type="number"
                  min={1}
                  max={31}
                  value={oySanasi}
                  onChange={(e) => {
                    const n = Math.max(1, Math.min(31, Number(e.target.value) || 1));
                    setOySanasi(n);
                  }}
                  className="w-20 h-10 px-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 text-sm font-mono-tabular text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Music Configuration */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-500" />
                <span>Musiqa</span>
              </span>
              <button
                type="button"
                onClick={handleTogglePreview}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isPreviewPlaying ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>To‘xtatish</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Oldindan eshitish</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-900/5 dark:bg-white/[0.06]">
              <button
                type="button"
                onClick={() => setMusicMode('auto')}
                className={`min-h-[40px] px-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  musicMode === 'auto'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Avtomatik
              </button>
              <button
                type="button"
                onClick={() => setMusicMode('preset')}
                className={`min-h-[40px] px-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  musicMode === 'preset'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Ro‘yxatdan
              </button>
              <button
                type="button"
                onClick={() => setMusicMode('custom')}
                className={`min-h-[40px] px-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  musicMode === 'custom'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Fayl yuklash
              </button>
            </div>

            {musicMode === 'auto' && (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Tanlangan toifa ({toifa}) uchun avtomatik kuy: <span className="font-semibold">{autoTrack.title}</span> ({autoTrack.moodLabel})
              </p>
            )}

            {musicMode === 'preset' && (
              <select
                aria-label="Ilovadagi musiqa ro‘yxati"
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BUILTIN_TRACKS.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.category} · {track.title} ({track.moodLabel})
                  </option>
                ))}
              </select>
            )}

            {musicMode === 'custom' && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={uploadingAudio}
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploadingAudio ? 'Yuklanmoqda...' : 'Qurilmadan audio tanlash'}</span>
                  </button>
                  {customAudioName && (
                    <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[220px]">
                      Tanlangan: {customAudioName}
                    </span>
                  )}
                </div>

                {savedCustomAudios.length > 0 && (
                  <select
                    aria-label="Yuklangan audio fayllar"
                    value={customAudioId || ''}
                    onChange={(e) => {
                      const found = savedCustomAudios.find((a) => a.id === e.target.value);
                      if (found) {
                        setCustomAudioId(found.id);
                        setCustomAudioName(found.name);
                      }
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="" disabled>
                      Saqlangan audio faylni tanlang
                    </option>
                    {savedCustomAudios.map((audio) => (
                      <option key={audio.id} value={audio.id}>
                        {audio.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Volume slider */}
            <div className="flex items-center gap-3 pt-1">
              <Volume2 className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <label
                htmlFor="modal-volume-slider"
                className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap"
              >
                Ovoz balandligi
              </label>
              <input
                id="modal-volume-slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(e) => onChangeVolume(Number(e.target.value) / 100)}
                className="flex-1 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-mono-tabular w-9 text-right text-slate-600 dark:text-slate-300">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                musicEngine.stop();
                onClose();
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer whitespace-nowrap"
            >
              {editingTask ? 'Saqlash' : 'Qo‘shish'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
