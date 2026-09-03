import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, AlertTriangle, X } from 'lucide-react';

interface AmbientAnnoyancesProps {
  screenTransitionCount: number;
  onThemeToggleShake?: () => void;
  undoToastData?: { message: string; onUndo: () => void } | null;
  onDismissUndoToast?: () => void;
}

export const AmbientAnnoyances: React.FC<AmbientAnnoyancesProps> = ({
  screenTransitionCount,
  onThemeToggleShake,
  undoToastData,
  onDismissUndoToast,
}) => {
  // 1. "Rate This App" modal every 6th screen transition
  const [showRateModal, setShowRateModal] = useState(false);
  const [lastTriggeredTransition, setLastTriggeredTransition] = useState(0);

  // 2. Persistent "Your session will expire soon" banner every 90s
  const [showSessionBanner, setShowSessionBanner] = useState(false);

  // 3. Undo Toast: button is only clickable for first 1 second of a 5-second toast
  const [undoClickable, setUndoClickable] = useState(true);

  // Mouse shake detector for Dark Mode / Light Mode
  const mouseMovesRef = useRef<{ x: number; time: number }[]>([]);

  // Rate This App trigger on every 6 transitions
  useEffect(() => {
    if (
      screenTransitionCount > 0 &&
      screenTransitionCount % 6 === 0 &&
      screenTransitionCount !== lastTriggeredTransition
    ) {
      setShowRateModal(true);
      setLastTriggeredTransition(screenTransitionCount);
    }
  }, [screenTransitionCount, lastTriggeredTransition]);

  // Session banner timer: every 90 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowSessionBanner(true);
    }, 90000);

    // Also show once around 45s in for demonstration if not dismissed
    const initialTimer = setTimeout(() => {
      setShowSessionBanner(true);
    }, 45000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, []);

  // Undo button clickable only for 1s
  useEffect(() => {
    if (undoToastData) {
      setUndoClickable(true);
      const disableTimer = setTimeout(() => {
        setUndoClickable(false);
      }, 1000); // Only clickable for 1 second!

      const dismissTimer = setTimeout(() => {
        if (onDismissUndoToast) onDismissUndoToast();
      }, 5000); // 5 second total toast

      return () => {
        clearTimeout(disableTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, [undoToastData, onDismissUndoToast]);

  // Hidden mouse shake detector: rapid horizontal movement switches theme
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      mouseMovesRef.current.push({ x: e.clientX, time: now });

      // Keep only recent moves within 600ms
      mouseMovesRef.current = mouseMovesRef.current.filter((m) => now - m.time < 600);

      if (mouseMovesRef.current.length > 8) {
        // Count directional changes
        let directionChanges = 0;
        let lastDirection = 0;

        for (let i = 1; i < mouseMovesRef.current.length; i++) {
          const dx = mouseMovesRef.current[i].x - mouseMovesRef.current[i - 1].x;
          if (Math.abs(dx) > 15) {
            const dir = dx > 0 ? 1 : -1;
            if (lastDirection !== 0 && dir !== lastDirection) {
              directionChanges++;
            }
            lastDirection = dir;
          }
        }

        if (directionChanges >= 4) {
          // Trigger hidden theme shake!
          if (onThemeToggleShake) {
            onThemeToggleShake();
          }
          mouseMovesRef.current = [];
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [onThemeToggleShake]);

  return (
    <>
      {/* 1. "Your session will expire soon" Banner (Appears every 90s) */}
      <AnimatePresence>
        {showSessionBanner && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2 max-w-md mx-auto w-full justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span>Your session will expire soon! Please verify activity.</span>
              </div>
              <button
                onClick={() => setShowSessionBanner(false)}
                className="px-3 py-1 bg-white text-rose-600 font-bold rounded-md hover:bg-rose-50 text-[11px] cursor-pointer shadow-xs"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. "Rate This App" Modal (every 6th transition) */}
      <AnimatePresence>
        {showRateModal && (
          <div className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative">
              {/* The invisible/1px 'X' in the drop shadow outside the visible modal border! */}
              <button
                id="rate-app-shadow-close-btn"
                onClick={() => setShowRateModal(false)}
                title="Dismiss"
                style={{ position: 'absolute', top: '-18px', right: '-18px' }}
                className="w-5 h-5 flex items-center justify-center text-transparent hover:text-slate-400 cursor-pointer group"
              >
                {/* Spec: A 1px '×' nested in the corner of the modal's drop shadow, technically outside the visible modal border */}
                <span className="text-[9px] text-slate-400/40 group-hover:text-white font-mono select-none">
                  ×
                </span>
              </button>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-xs bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-slate-800 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 fill-amber-500" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                  Enjoying Instagram?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Your feedback shapes our app. Tap a star to give us a 5-star rating on the App Store!
                </p>

                <div className="flex items-center justify-center gap-2 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setShowRateModal(false)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className="w-6 h-6 fill-amber-400" />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowRateModal(false)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    Rate on App Store
                  </button>
                  <button
                    onClick={() => setShowRateModal(false)}
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium cursor-pointer"
                  >
                    Remind me later
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Undo Toast (Clickable only for 1s of 5s) */}
      <AnimatePresence>
        {undoToastData && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-16 left-4 right-4 sm:left-auto sm:right-6 z-[90] max-w-sm bg-slate-900 text-white rounded-xl px-4 py-3 shadow-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
          >
            <span>{undoToastData.message}</span>
            <button
              onClick={() => {
                if (undoClickable) {
                  undoToastData.onUndo();
                  if (onDismissUndoToast) onDismissUndoToast();
                }
              }}
              className={`font-bold px-2 py-1 rounded transition-colors ${
                undoClickable
                  ? 'text-blue-400 hover:text-blue-300 cursor-pointer'
                  : 'text-blue-400 cursor-default' // visibly present but inert!
              }`}
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
