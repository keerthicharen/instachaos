import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  RefreshCw,
  Volume2,
  CheckCircle2,
  AlertCircle,
  X,
  Grid,
  Type,
  Headphones,
} from 'lucide-react';

interface DmCaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type CaptchaMode = 'image_grid' | 'text' | 'audio';

interface ImageChallenge {
  prompt: string;
  category: string;
  images: { id: number; url: string; isMatch: boolean; label: string }[];
}

const IMAGE_CHALLENGES: ImageChallenge[] = [
  {
    prompt: 'Select all squares with Traffic Lights',
    category: 'traffic lights',
    images: [
      { id: 0, url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200&h=200&fit=crop', isMatch: true, label: 'Traffic light at intersection' },
      { id: 1, url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=200&h=200&fit=crop', isMatch: false, label: 'City skyline' },
      { id: 2, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&fit=crop', isMatch: false, label: 'Mountain' },
      { id: 3, url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=200&h=200&fit=crop', isMatch: true, label: 'Yellow traffic signal' },
      { id: 4, url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&h=200&fit=crop', isMatch: false, label: 'Building facade' },
      { id: 5, url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=200&h=200&fit=crop', isMatch: true, label: 'Red stop light' },
      { id: 6, url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop', isMatch: false, label: 'Street cars' },
      { id: 7, url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=200&h=200&fit=crop', isMatch: false, label: 'Modern house' },
      { id: 8, url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop', isMatch: false, label: 'Desk computer' },
    ],
  },
  {
    prompt: 'Select all squares with Crosswalks',
    category: 'crosswalks',
    images: [
      { id: 0, url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=200&h=200&fit=crop', isMatch: true, label: 'Zebra pedestrian crossing' },
      { id: 1, url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=200&h=200&fit=crop', isMatch: false, label: 'Building wall' },
      { id: 2, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&fit=crop', isMatch: false, label: 'Landscape river' },
      { id: 3, url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=200&h=200&fit=crop', isMatch: true, label: 'Street pedestrian crossing stripes' },
      { id: 4, url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=200&h=200&fit=crop', isMatch: false, label: 'Metropolis buildings' },
      { id: 5, url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&h=200&fit=crop', isMatch: false, label: 'Sunlight tree' },
      { id: 6, url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200&h=200&fit=crop', isMatch: false, label: 'City street' },
      { id: 7, url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&h=200&fit=crop', isMatch: true, label: 'Asphalt crossing road' },
      { id: 8, url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=200&fit=crop', isMatch: false, label: 'Desert highway' },
    ],
  },
  {
    prompt: 'Select all squares with Bicycles',
    category: 'bicycles',
    images: [
      { id: 0, url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&h=200&fit=crop', isMatch: true, label: 'Vintage road bike' },
      { id: 1, url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=200&fit=crop', isMatch: false, label: 'Sports car' },
      { id: 2, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&fit=crop', isMatch: false, label: 'Valley lake' },
      { id: 3, url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=200&h=200&fit=crop', isMatch: true, label: 'Bicycle parked by brick wall' },
      { id: 4, url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&h=200&fit=crop', isMatch: false, label: 'Skyscraper' },
      { id: 5, url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop', isMatch: false, label: 'Laptop workspace' },
      { id: 6, url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=200&h=200&fit=crop', isMatch: false, label: 'City towers' },
      { id: 7, url: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=200&h=200&fit=crop', isMatch: true, label: 'Mountain bike wheel' },
      { id: 8, url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=200&h=200&fit=crop', isMatch: false, label: 'Wall exterior' },
    ],
  },
];

const RANDOM_TEXT_CODES = ['7W9kP', 'M3b8X', 'K4r2N', '9Q5zT', 'B6y1H', '4V8sD', 'R2m7C'];
const RANDOM_AUDIO_CODES = ['4829', '7153', '9306', '6284', '3591'];

export const DmCaptchaModal: React.FC<DmCaptchaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<CaptchaMode>('image_grid');

  // Image Grid State
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);

  // Text CAPTCHA State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [textCode, setTextCode] = useState('7W9kP');
  const [textInput, setTextInput] = useState('');

  // Audio CAPTCHA State
  const [audioCode, setAudioCode] = useState('4829');
  const [audioInput, setAudioInput] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Status State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize random challenges
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      setSelectedImageIds([]);
      setTextInput('');
      setAudioInput('');
      setChallengeIndex(Math.floor(Math.random() * IMAGE_CHALLENGES.length));
      setTextCode(RANDOM_TEXT_CODES[Math.floor(Math.random() * RANDOM_TEXT_CODES.length)]);
      setAudioCode(RANDOM_AUDIO_CODES[Math.floor(Math.random() * RANDOM_AUDIO_CODES.length)]);
    }
  }, [isOpen]);

  // Draw distorted text CAPTCHA on canvas
  useEffect(() => {
    if (activeMode === 'text' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Canvas setup
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Noise background dots
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(
          Math.random() * 200
        )}, ${Math.floor(Math.random() * 200)}, 0.4)`;
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 2.5 + 0.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Sine wave lines
      for (let line = 0; line < 3; line++) {
        ctx.strokeStyle = `rgba(59, 130, 246, 0.45)`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        const yOffset = 18 + line * 16;
        for (let x = 0; x < canvas.width; x += 5) {
          const y = yOffset + Math.sin((x + line * 30) / 16) * 9;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw distorted characters
      const chars = textCode.split('');
      const charWidth = (canvas.width - 40) / chars.length;
      chars.forEach((char, idx) => {
        ctx.save();
        const x = 24 + idx * charWidth;
        const y = 38 + (Math.random() * 8 - 4);
        const angle = (Math.random() - 0.5) * 0.45;

        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.font = `bold ${Math.floor(Math.random() * 6) + 26}px sans-serif`;
        ctx.fillStyle = ['#1e293b', '#0f172a', '#2563eb', '#475569', '#334155'][idx % 5];
        ctx.fillText(char, 0, 0);

        ctx.restore();
      });
    }
  }, [activeMode, textCode]);

  // Audio CAPTCHA Player
  const playAudioCaptcha = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);

    try {
      // 1. Spoken digits using window.speechSynthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const digitsSpoken = audioCode.split('').join(' . ');
        const utterance = new SpeechSynthesisUtterance(digitsSpoken);
        utterance.rate = 0.75;
        utterance.pitch = 0.9;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback tone beeps
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
          setTimeout(() => setIsPlayingAudio(false), 1200);
        } else {
          setIsPlayingAudio(false);
        }
      }
    } catch {
      setIsPlayingAudio(false);
    }
  };

  // Toggle image selection
  const handleToggleImage = (id: number) => {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    setErrorMessage(null);
  };

  // Refresh current challenge
  const handleRefreshChallenge = () => {
    setErrorMessage(null);
    if (activeMode === 'image_grid') {
      setSelectedImageIds([]);
      setChallengeIndex((prev) => (prev + 1) % IMAGE_CHALLENGES.length);
    } else if (activeMode === 'text') {
      setTextInput('');
      const nextCodes = RANDOM_TEXT_CODES.filter((c) => c !== textCode);
      setTextCode(nextCodes[Math.floor(Math.random() * nextCodes.length)]);
    } else if (activeMode === 'audio') {
      setAudioInput('');
      const nextCodes = RANDOM_AUDIO_CODES.filter((c) => c !== audioCode);
      setAudioCode(nextCodes[Math.floor(Math.random() * nextCodes.length)]);
    }
  };

  // Submit and verify CAPTCHA
  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    let passed = false;

    if (activeMode === 'image_grid') {
      const currentChallenge = IMAGE_CHALLENGES[challengeIndex];
      const correctIds = currentChallenge.images.filter((img) => img.isMatch).map((img) => img.id);

      // Check if user selected all matches and no non-matches
      const isExactMatch =
        selectedImageIds.length === correctIds.length &&
        selectedImageIds.every((id) => correctIds.includes(id));

      if (isExactMatch) {
        passed = true;
      } else {
        setErrorMessage(
          `Verification failed: Please make sure you selected all squares with ${currentChallenge.category}.`
        );
        // Shuffle to another challenge
        setTimeout(() => {
          setSelectedImageIds([]);
          setChallengeIndex((prev) => (prev + 1) % IMAGE_CHALLENGES.length);
        }, 1200);
      }
    } else if (activeMode === 'text') {
      if (textInput.trim().toLowerCase() === textCode.toLowerCase()) {
        passed = true;
      } else {
        setErrorMessage('Incorrect text entered. A new verification code has been generated.');
        setTimeout(() => {
          setTextInput('');
          setTextCode(RANDOM_TEXT_CODES[Math.floor(Math.random() * RANDOM_TEXT_CODES.length)]);
        }, 1000);
      }
    } else if (activeMode === 'audio') {
      if (audioInput.trim() === audioCode.trim()) {
        passed = true;
      } else {
        setErrorMessage('Incorrect audio digits. Listen again and re-enter.');
      }
    }

    if (passed) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 700);
    }
  };

  if (!isOpen) return null;

  const currentChallenge = IMAGE_CHALLENGES[challengeIndex];

  return (
    <AnimatePresence>
      <div
        id="dm-captcha-backdrop"
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        >
          {/* Header Banner */}
          <div className="bg-blue-600 px-4 py-3 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-100" />
              <div>
                <h3 className="font-bold text-sm leading-tight">Security Verification</h3>
                <p className="text-[10px] text-blue-100 leading-tight">Required to open Direct Messages</p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="dm-captcha-close-btn"
              className="p-1 text-blue-200 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State Overlay */}
          {isSuccess ? (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Human Verified!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Opening your Direct Messages inbox...
              </p>
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              {/* Challenge Subheader */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {activeMode === 'image_grid' && currentChallenge.prompt}
                  {activeMode === 'text' && 'Type the characters from the image'}
                  {activeMode === 'audio' && 'Listen to audio and enter the digits'}
                </span>
                <button
                  type="button"
                  onClick={handleRefreshChallenge}
                  id="dm-captcha-refresh-btn"
                  className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title="Generate new challenge"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* MODE 1: Image Grid CAPTCHA */}
              {activeMode === 'image_grid' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {currentChallenge.images.map((img) => {
                      const isSelected = selectedImageIds.includes(img.id);
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => handleToggleImage(img.id)}
                          className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'ring-3 ring-blue-600 scale-[0.96] shadow-sm'
                              : 'hover:opacity-90 active:scale-95'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover select-none pointer-events-none"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md animate-in zoom-in-75">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    Click each matching image, then tap Verify below
                  </p>
                </div>
              )}

              {/* MODE 2: Distorted Text CAPTCHA */}
              {activeMode === 'text' && (
                <form onSubmit={handleVerify} className="space-y-3">
                  <div className="flex flex-col items-center justify-center p-2 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <canvas
                      ref={canvasRef}
                      width={280}
                      height={60}
                      className="rounded-lg shadow-inner select-none"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if ('speechSynthesis' in window) {
                            const u = new SpeechSynthesisUtterance(textCode.split('').join(' '));
                            u.rate = 0.8;
                            window.speechSynthesis.speak(u);
                          }
                        }}
                        className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        Listen to code
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => {
                      setTextInput(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Enter security code"
                    autoFocus
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-sm font-mono tracking-widest text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </form>
              )}

              {/* MODE 3: Audio CAPTCHA */}
              {activeMode === 'audio' && (
                <form onSubmit={handleVerify} className="space-y-3">
                  <div className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={playAudioCaptcha}
                      disabled={isPlayingAudio}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                      <span>{isPlayingAudio ? 'Playing numbers...' : 'Play Audio Code'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Listen to the sequence of spoken digits
                    </span>
                  </div>

                  <input
                    type="text"
                    value={audioInput}
                    onChange={(e) => {
                      setAudioInput(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Enter spoken digits (e.g. 4829)"
                    autoFocus
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-sm font-mono tracking-widest text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </form>
              )}

              {/* Error Message Feedback */}
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[11px] leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                {/* Switch challenge modes */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('image_grid');
                      setErrorMessage(null);
                    }}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      activeMode === 'image_grid'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title="Image Grid CAPTCHA"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('text');
                      setErrorMessage(null);
                    }}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      activeMode === 'text'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title="Distorted Text CAPTCHA"
                  >
                    <Type className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('audio');
                      setErrorMessage(null);
                    }}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      activeMode === 'audio'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title="Audio CAPTCHA"
                  >
                    <Headphones className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify()}
                    id="dm-captcha-verify-btn"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Verify</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
