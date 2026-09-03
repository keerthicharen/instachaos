import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, ShieldAlert, Sparkles, Cookie, ArrowRight } from 'lucide-react';

interface ChaosOverlayProps {
  isChaosMode?: boolean;
  onTriggerDirectMessages?: () => void;
}

export const ChaosOverlay: React.FC<ChaosOverlayProps> = ({
  isChaosMode = true,
  onTriggerDirectMessages,
}) => {
  // Step 1: Initial Cookie modal ("Accept All" vs "Manage Preferences")
  // Step 2: Nested Confirmation ("Are you sure you don't want the personalized version?")
  const [cookieModalStep, setCookieModalStep] = useState<1 | 2 | null>(1);
  const [dodgeCount, setDodgeCount] = useState(0);
  const [swappedButtons, setSwappedButtons] = useState(false);
  const [dodgeOffset, setDodgeOffset] = useState({ x: 0, y: 0 });

  if (!isChaosMode) return null;

  const handleInitialChoice = () => {
    // Spec: Clicking EITHER button opens a second nested modal!
    setCookieModalStep(2);
  };

  const handleHoverDodge = () => {
    setDodgeCount((prev) => prev + 1);
    setSwappedButtons((prev) => !prev);
    // Button dodge offset: shifts around the container
    const rx = (Math.random() - 0.5) * 110;
    const ry = (Math.random() - 0.5) * 70;
    setDodgeOffset({ x: rx, y: ry });
  };

  const handleDismissCookieModal = () => {
    setCookieModalStep(null);
  };

  return (
    <>
      {/* Top Banner indicating satire mode is permanently running */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-amber-500 text-slate-950 px-3 py-1.5 text-xs font-semibold flex items-center justify-between shadow-xs border-b border-amber-600/30 select-none">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-slate-950 animate-bounce flex-shrink-0" />
          <span className="truncate">
            <strong>InstaChaos:</strong> Indirection, misdirection & rotating wheels enabled!
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onTriggerDirectMessages && (
            <button
              onClick={onTriggerDirectMessages}
              className="text-[10px] bg-amber-600/30 hover:bg-amber-600/50 text-slate-950 px-2.5 py-0.5 rounded font-bold cursor-pointer transition-colors"
              title="Swipe right on feed or click here to access real DMs"
            >
              Swipe Right for DMs →
            </button>
          )}
        </div>
      </div>

      {/* Parody Cookie Consent: Two-Step Nested Modal with Dodge Buttons */}
      <AnimatePresence>
        {cookieModalStep !== null && (
          <div className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
            {cookieModalStep === 1 && (
              /* Step 1: Accept All vs Manage Preferences */
              <motion.div
                key="cookie-step-1"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                  <Cookie className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white mb-1.5">
                  We Value Your Cookie Preferences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                  Instagram uses cookies and local device identifiers to curate your smart rotating
                  algorithm and ambient telemetry.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={handleInitialChoice}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleInitialChoice}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                  >
                    Manage Preferences
                  </button>
                </div>
              </motion.div>
            )}

            {cookieModalStep === 2 && (
              /* Step 2: Nested confirmation with button dodge */
              <motion.div
                key="cookie-step-2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2">
                  <ShieldAlert className="w-6 h-6 text-rose-500" />
                </div>

                <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white mb-2">
                  Confirm Preference Selection
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-6">
                  "Are you sure you don't want the personalized version?"
                </p>

                {/* Dodging Buttons Arena */}
                <div className="relative min-h-[60px] flex items-center justify-center mb-2">
                  <motion.div
                    style={{
                      transform: `translate(${dodgeOffset.x}px, ${dodgeOffset.y}px)`,
                    }}
                    transition={{ type: 'spring', damping: 15, stiffness: 220 }}
                    className="flex items-center gap-3"
                  >
                    {swappedButtons ? (
                      <>
                        <button
                          onMouseEnter={handleHoverDodge}
                          onClick={handleDismissCookieModal}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Yes
                        </button>
                        <button
                          onMouseEnter={handleHoverDodge}
                          onClick={handleDismissCookieModal}
                          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onMouseEnter={handleHoverDodge}
                          onClick={handleDismissCookieModal}
                          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                        >
                          No
                        </button>
                        <button
                          onMouseEnter={handleHoverDodge}
                          onClick={handleDismissCookieModal}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Yes
                        </button>
                      </>
                    )}
                  </motion.div>
                </div>

                {dodgeCount >= 3 && (
                  <div className="mt-3">
                    <button
                      onClick={handleDismissCookieModal}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                    >
                      (Mercy bypass: Cornered! Click to confirm)
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
