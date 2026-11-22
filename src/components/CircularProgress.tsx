interface CircularProgressProps {
  percentage: number;
  completed: number;
  total: number;
}

export function CircularProgress({ percentage, completed, total }: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const size = 112;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200/80 dark:text-white/10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#mylife-progress-grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
          <defs>
            <linearGradient id="mylife-progress-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {clamped}%
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Bajarilganlar foizi
        </div>
        <div className="mt-1 font-display text-lg font-semibold text-slate-900 dark:text-white tabular-nums">
          {completed} / {total} ta ish
        </div>
        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          {total === 0
            ? 'Bugun uchun ishlar belgilanmagan'
            : clamped === 100
              ? 'Barcha bugungi ishlar bajarildi!'
              : `${total - completed} ta ish qoldi`}
        </div>
      </div>
    </div>
  );
}
