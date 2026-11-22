import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingScreenProps {
  onSubmitName: (name: string) => void;
}

export function OnboardingScreen({ onSubmitName }: OnboardingScreenProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Iltimos, ismingizni kiriting');
      return;
    }
    onSubmitName(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white"
      >
        <div className="mb-6">
          <div className="font-display text-2xl font-bold tracking-tight text-indigo-700 dark:text-indigo-300">
            mylife
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mt-4 tracking-tight text-balance">
            Assalomu alaykum!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Kuningizni tartibli va xotirjam rejalashtirish uchun ismingizni yozing.
            Barcha ma’lumotlar faqat shu qurilmada saqlanadi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="onboarding-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
            >
              Ismingiz
            </label>
            <input
              id="onboarding-name"
              type="text"
              autoFocus
              maxLength={40}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Masalan: Azizbek"
              className="w-full h-12 px-4 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {error && (
              <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-12 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Boshlash</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
