import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let val = 0;
    const interval = setInterval(() => {
      val += Math.random() * 8 + 3;
      if (val >= 100) {
        val = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setDone(true), 500);
        setTimeout(onComplete, 1200);
      } else {
        setProgress(val);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  const circumference = 2 * Math.PI * 52;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[10001] flex flex-col items-center justify-center gradient-forest"
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
        >
          {/* Rotating earth ring */}
          <div className="relative flex h-44 w-44 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="rgba(168,201,188,0.12)"
                strokeWidth="1.5"
              />
              <circle
                ref={ringRef}
                cx="60" cy="60" r="52"
                fill="none"
                stroke="url(#loadGrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                style={{ transition: 'stroke-dashoffset 0.2s ease' }}
              />
              <defs>
                <linearGradient id="loadGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7ba593" />
                  <stop offset="100%" stopColor="#c9a96a" />
                </linearGradient>
              </defs>
            </svg>

            {/* Spinning earth glyph */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="h-20 w-20 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #2d5141 0%, #0e3050 60%, #061421 100%)',
                boxShadow: '0 0 40px -8px rgba(123,165,147,0.5), inset -8px -8px 24px rgba(0,0,0,0.5)',
              }}
            />
          </div>

          {/* Logo reveal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-10 text-center"
          >
            <p className="font-display text-sm uppercase tracking-[0.4em] text-forest-300">
              Resilient Earth
            </p>
            <p className="mt-1 font-display text-xs uppercase tracking-[0.3em] text-soft-white-dim/60">
              Solutions Pvt. Ltd.
            </p>
          </motion.div>

          {/* Progress number */}
          <div className="absolute bottom-12 flex w-full items-center justify-center gap-3">
            <span className="font-display text-5xl font-light tabular-nums text-soft-white">
              {Math.round(progress)}
            </span>
            <span className="mb-2 text-sm text-forest-300">%</span>
          </div>

          {/* Bottom progress bar */}
          <div className="absolute bottom-0 h-px w-full bg-forest-700">
            <motion.div
              className="h-full bg-gradient-to-r from-forest-300 to-accent-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
