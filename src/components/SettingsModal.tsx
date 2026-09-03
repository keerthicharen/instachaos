import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Moon,
  Briefcase,
  Lock,
  LogOut,
  HelpCircle,
  Bell,
  Shield,
  Volume2,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react';
import { User, Post } from '../types';

interface SettingsModalProps {
  currentUser: User;
  userPosts: Post[];
  onClose: () => void;
  onUpdateProfile: (updated: Partial<User>) => void;
  onOpenDMs?: () => void;
  isChaosMode?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  userPosts,
  onClose,
  onUpdateProfile,
  onOpenDMs,
  isChaosMode = true,
}) => {
  // 1. Dark mode toggle switch state (Spec: ON displays as grey & recessed; OFF is blue, raised, glowing)
  const [darkModeActive, setDarkModeActive] = useState(false);

  // 2. Switch to Professional Account: cannot be toggled off once enabled.
  // Clicking shows confirm dialog with 'Continue' and 'Cancel', but both buttons execute the switch,
  // with 'Cancel' adding a 7-day analytics trial!
  const [isProfessional, setIsProfessional] = useState(currentUser.category !== undefined);
  const [showProConfirmModal, setShowProConfirmModal] = useState(false);
  const [analyticsTrialAdded, setAnalyticsTrialAdded] = useState(false);

  // 3. Audio CAPTCHA for Private Account
  const [isPrivate, setIsPrivate] = useState(false);
  const [showAudioCaptcha, setShowAudioCaptcha] = useState(false);
  const [captchaAttempts, setCaptchaAttempts] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Synthesize restaurant ambiance / murmuring clatter sound
  const playRestaurantAmbiance = (id: number) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
      return;
    }
    setPlayingAudioId(id);

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      // Pink noise + low pass filter to simulate distant crowd chatter and plates
      const bufferSize = ctx.sampleRate * 3; // 3 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800 + id * 200; // subtle variations

      noiseSource.connect(filter);
      filter.connect(ctx.destination);
      noiseSource.start();

      setTimeout(() => {
        setPlayingAudioId(null);
      }, 3000);
    } catch (e) {
      setTimeout(() => setPlayingAudioId(null), 3000);
    }
  };

  const handleTogglePrivate = () => {
    if (!isPrivate) {
      setShowAudioCaptcha(true);
      setCaptchaAttempts(0);
      setCaptchaInput('');
      setCaptchaError(null);
    } else {
      setIsPrivate(false);
    }
  };

  // Spec: Guessing any answer accepts it on the third attempt!
  const handleSubmitCaptcha = (e: React.FormEvent) => {
    e.preventDefault();
    const nextAttempts = captchaAttempts + 1;
    setCaptchaAttempts(nextAttempts);

    if (nextAttempts >= 3) {
      // Accepted on third attempt!
      setIsPrivate(true);
      setShowAudioCaptcha(false);
      setCaptchaError(null);
    } else {
      setCaptchaError(
        `Incorrect digits (${nextAttempts}/3 attempts). Audio contains indistinct ambient chatter. Please listen again.`
      );
    }
  };

  // Professional Account Handler
  const handleInitiateProSwitch = () => {
    if (isProfessional) {
      // Spec: option CANNOT be toggled off once enabled!
      setShowProConfirmModal(true);
    } else {
      setShowProConfirmModal(true);
    }
  };

  // Spec: both 'Continue' and 'Cancel' execute the switch, with 'Cancel' adding a 7-day analytics trial!
  const handleProChoice = (choice: 'continue' | 'cancel') => {
    setIsProfessional(true);
    const category =
      choice === 'cancel'
        ? 'Professional Creator (+ 7-Day Analytics Trial)'
        : 'Professional Creator';

    if (choice === 'cancel') {
      setAnalyticsTrialAdded(true);
    }

    onUpdateProfile({ category });
    setShowProConfirmModal(false);
  };

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col justify-between overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
            Settings & Privacy
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings options list */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Note about airplane misdirection */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-[11px] text-amber-800 dark:text-amber-200 space-y-2">
            <div>
              <strong>InstaChaos Routing:</strong> Tapping the top-right paper airplane brought you here to Settings!
              To access your real DMs, <em>swipe right on the Home feed</em>, or solve the required security CAPTCHA:
            </div>
            {onOpenDMs && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDMs();
                }}
                id="settings-open-dms-captcha-btn"
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <span>Unlock Direct Messages (Solve CAPTCHA)</span>
              </button>
            )}
          </div>

          {/* Spec: 'Dark Mode' toggle switch visual states are REVERSED:
              'ON' displays as grey and recessed (off-style);
              'OFF' is blue, raised, and glowing (on-style). */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Dark Mode</span>
                  <span className="text-[10px] text-slate-400">
                    ({darkModeActive ? 'ON' : 'OFF'})
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {isChaosMode
                    ? 'Visual switch state is inverted'
                    : 'Toggle interface theme'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setDarkModeActive((prev) => !prev)}
              className={`w-12 h-6.5 rounded-full p-1 transition-all cursor-pointer flex items-center ${
                isChaosMode
                  ? darkModeActive
                    ? 'bg-slate-300 dark:bg-slate-700 shadow-inner justify-start' // ON looks like recessed grey OFF
                    : 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.8)] justify-end' // OFF looks like glowing blue ON
                  : darkModeActive
                  ? 'bg-blue-600 justify-end'
                  : 'bg-slate-300 justify-start'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white transition-all ${
                  isChaosMode && !darkModeActive ? 'shadow-md scale-105' : 'shadow-xs'
                }`}
              />
            </button>
          </div>

          {/* Spec: 'Switch to Professional Account' cannot be toggled off once enabled.
              Clicking shows confirm dialog with 'Continue' and 'Cancel', but both buttons execute the switch,
              with 'Cancel' adding a 7-day analytics trial! */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Professional Account
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isProfessional
                      ? analyticsTrialAdded
                        ? 'Professional Account (+ 7-Day Analytics Trial)'
                        : 'Professional Account (Locked)'
                      : 'Standard Personal Account'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleInitiateProSwitch}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-slate-900 dark:text-white cursor-pointer border border-slate-200/50"
              >
                {isProfessional ? 'Active' : 'Switch'}
              </button>
            </div>
          </div>

          {/* Spec: Setting your account to 'Private' requires solving an audio CAPTCHA
              where all three audio options are recordings of restaurant ambiance
              with no discernable numbers, but guessing any answer accepts it on the third attempt. */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Private Account</div>
                <div className="text-[10px] text-slate-400">
                  {isPrivate ? 'Enabled (Audio CAPTCHA verified)' : 'Public (Requires Audio CAPTCHA)'}
                </div>
              </div>
            </div>

            <button
              onClick={handleTogglePrivate}
              className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                isPrivate ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Additional Options */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 py-1 hover:text-slate-900 cursor-pointer">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Security & Passwords</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 py-1 hover:text-slate-900 cursor-pointer">
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Notification Preferences</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 py-1 hover:text-slate-900 cursor-pointer">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help & Support</span>
            </div>
            <div className="flex items-center gap-2.5 text-rose-500 py-1 hover:text-rose-600 font-semibold cursor-pointer">
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Close Settings
          </button>
        </div>
      </motion.div>

      {/* Professional Account Confirmation Dialog Modal */}
      <AnimatePresence>
        {showProConfirmModal && (
          <div className="fixed inset-0 z-[95] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-white dark:bg-[#0f172a] rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Switch to Professional Account?
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Professional accounts get real-time insights and professional tools. Note: Once enabled, this action cannot be reversed.
              </p>

              <div className="space-y-2">
                {/* Continue executes switch */}
                <button
                  onClick={() => handleProChoice('continue')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Continue
                </button>

                {/* Cancel ALSO executes switch, and adds 7-day analytics trial! */}
                <button
                  onClick={() => handleProChoice('cancel')}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audio CAPTCHA Modal for Private Account */}
      <AnimatePresence>
        {showAudioCaptcha && (
          <div className="fixed inset-0 z-[95] bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span>Security Audio CAPTCHA</span>
                </h4>
                <button
                  onClick={() => setShowAudioCaptcha(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Listen to the audio recordings and enter the numbers spoken.
                (Note: all clips are recordings of noisy restaurant ambiance with clinking silverware).
              </p>

              {/* 3 audio tracks */}
              <div className="space-y-2 mb-4">
                {[1, 2, 3].map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <Volume2 className="w-4 h-4 text-slate-400" />
                      <span>Audio Sample #{id} (Bistro Ambiance)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => playRestaurantAmbiance(id)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {playingAudioId === id ? (
                        <>
                          <Pause className="w-3 h-3 animate-pulse" /> Playing...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" /> Play
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmitCaptcha} className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter the 4 numbers you heard..."
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50 focus:outline-none focus:ring-1 focus:ring-blue-600 text-center font-mono"
                />

                {captchaError && (
                  <div className="text-[10px] text-rose-500 font-semibold text-left">
                    {captchaError}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAudioCaptcha(false)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Verify ({captchaAttempts}/3)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
