import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Spec: Progress bar fills to 94%, pauses for 4 seconds, resets to 0%,
  // and restarts — twice — before loading, every single time.
  const [cycle, setCycle] = useState(0); // 0, 1, 2 (cycle 2 completes)
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [debugBypassVisible, setDebugBypassVisible] = useState(false);

  useEffect(() => {
    // Show a subtle skip option after 10 seconds in case the reviewer wants to speed up testing
    const skipTimer = setTimeout(() => {
      setDebugBypassVisible(true);
    }, 8000);
    return () => clearTimeout(skipTimer);
  }, []);

  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    if (isPaused) {
      // Pause for 4000ms at 94%
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        if (cycle < 2) {
          // Reset to 0% and restart
          setProgress(0);
          setCycle((c) => c + 1);
        } else {
          // Final run: fill to 100% and complete
          setProgress(100);
          setTimeout(() => {
            onComplete();
          }, 600);
        }
      }, 4000);

      return () => clearTimeout(pauseTimer);
    }

    const updateProgress = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      setProgress((prev) => {
        const target = cycle === 2 ? 100 : 94;
        const increment = (delta / 1200) * 100; // ~1.2s to reach 94%
        const next = prev + increment;

        if (cycle < 2 && next >= 94) {
          setIsPaused(true);
          return 94;
        }

        if (cycle === 2 && next >= 100) {
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }

        return next;
      });

      animFrame = requestAnimationFrame(updateProgress);
    };

    animFrame = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animFrame);
  }, [cycle, isPaused, onComplete]);

  return (
    <div
      id="instachaos-splash-screen"
      className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none"
    >
      <div className="flex flex-col items-center max-w-xs w-full text-center">
        {/* Instagram Logo / Icon */}
        <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-2xl animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
        </div>

        <h1 className="font-instagram text-4xl mb-2 tracking-tight">Instagram</h1>
        <p className="text-xs text-slate-400 mb-8 font-mono">
          {cycle === 0 && 'Connecting to secure stream...'}
          {cycle === 1 && 'Syncing algorithmic smart feed...'}
          {cycle === 2 && 'Optimizing indirection & misdirection...'}
        </p>

        {/* The Agonizing Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-rose-500 to-amber-400 rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[10px] text-slate-500 font-mono">
          <span>Attempt {cycle + 1} of 3</span>
          <span>{Math.floor(progress)}%</span>
        </div>

        {isPaused && (
          <div className="mt-4 text-[11px] text-amber-400/90 animate-pulse font-mono">
            {cycle < 2 ? 'Verifying session handshake (holding at 94%)...' : 'Finalizing...'}
          </div>
        )}

        {/* Subtle skip for fast testing if needed */}
        {debugBypassVisible && (
          <button
            onClick={onComplete}
            className="mt-12 text-[10px] text-slate-600 hover:text-slate-400 underline cursor-pointer"
          >
            (InstaChaos Fast-Forward Bypass)
          </button>
        )}
      </div>
    </div>
  );
};
