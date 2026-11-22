import { useEffect } from 'react';
import { motion } from 'motion/react';

interface WelcomeSplashProps {
  userName: string;
  onFinish: () => void;
}

export function WelcomeSplash({ userName, onFinish }: WelcomeSplashProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onFinish();
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.03, y: -8 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="font-display text-sm font-semibold tracking-wider text-white/80 mb-3"
        >
          mylife
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight text-balance drop-shadow-sm"
        >
          Xush kelibsiz, {userName}!
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.25, duration: 1.6, ease: 'easeInOut' }}
          className="mt-8 h-1 w-40 mx-auto rounded-full bg-white/40 origin-left overflow-hidden"
        >
          <div className="h-full w-full bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}
