import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageSquare, Send, Radio, Users, SwitchCamera, Mic, MicOff, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LiveComment } from '../types';

interface LiveStreamViewProps {
  currentUser: User;
  onClose: () => void;
  hostUser?: User; // if undefined, currentUser is hosting!
}

const SAMPLE_LIVE_COMMENTS: string[] = [
  'Hello from Tokyo! 🇯🇵',
  'Loving the vibes today!! 🔥',
  'What camera are you streaming on?',
  'Sending love from New York ❤️🗽',
  'Can you show the studio lights?',
  'Best stream of the day! 👏',
  'Wait, that background is so aesthetic ✨',
  'Greetings from Italy! 🇮🇹',
  'Such an inspiring conversation!',
  'Drop the playlist link please! 🎵',
];

interface FloatingHeart {
  id: number;
  color: string;
  x: number;
}

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({
  currentUser,
  onClose,
  hostUser,
}) => {
  const isHosting = !hostUser || hostUser.id === currentUser.id;
  const host = hostUser || currentUser;

  const [viewersCount, setViewersCount] = useState(isHosting ? 48 : 842);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [comments, setComments] = useState<LiveComment[]>([
    {
      id: 'c1',
      username: 'marcus_creates',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      message: 'Excited for this session! 🚀',
    },
    {
      id: 'c2',
      username: 'luna_designs',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      message: 'Hey everyone! 👋',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [showEndSummary, setShowEndSummary] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Viewer count fluctuation & incoming live comments simulation
  useEffect(() => {
    const commentInterval = setInterval(() => {
      const randomText = SAMPLE_LIVE_COMMENTS[Math.floor(Math.random() * SAMPLE_LIVE_COMMENTS.length)];
      const randomUser = ['tokyo_lens', 'wanderlust_sophia', 'chef_marco', 'design_daily', 'kate_photos'][
        Math.floor(Math.random() * 5)
      ];

      setComments((prev) => [
        ...prev.slice(-15),
        {
          id: `lc_${Date.now()}`,
          username: randomUser,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
          message: randomText,
        },
      ]);

      // viewer increment
      setViewersCount((prev) => Math.max(12, prev + Math.floor(Math.random() * 5) - 2));

      // occasionally trigger a heart
      if (Math.random() > 0.4) {
        addFloatingHeart();
      }
    }, 3500);

    return () => clearInterval(commentInterval);
  }, []);

  const addFloatingHeart = () => {
    const colors = ['#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#eab308'];
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * 60 - 30,
    };
    setHearts((prev) => [...prev.slice(-20), newHeart]);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: `my_c_${Date.now()}`,
        username: currentUser.username,
        avatar: currentUser.avatar,
        message: inputText.trim(),
      },
    ]);
    setInputText('');
    addFloatingHeart();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndLive = () => {
    if (isHosting) {
      setShowEndSummary(true);
    } else {
      onClose();
    }
  };

  return (
    <div id="live-stream-screen" className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none">
      <div className="relative w-full h-full max-w-md bg-neutral-950 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Background Visual (Live Video Feed) */}
        <div className="absolute inset-0 z-0">
          <img
            src={
              isHosting
                ? currentUser.avatar
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80'
            }
            alt="Live stream video"
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        {/* Top Header */}
        <div className="relative z-20 p-4 pt-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            {/* Host Avatar & Name */}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
              <img
                src={host.avatar}
                alt={host.username}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-bold">{host.username}</span>
            </div>

            {/* LIVE Badge */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-red-500 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>LIVE</span>
            </div>

            {/* Viewer Count */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md border border-white/20">
              <Users className="w-3.5 h-3.5 text-neutral-300" />
              <span className="font-semibold">{viewersCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/80 bg-black/30 px-2 py-0.5 rounded">
              {formatTime(secondsElapsed)}
            </span>
            <button
              onClick={handleEndLive}
              className="px-3 py-1 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {isHosting ? 'End Live' : 'Leave'}
            </button>
          </div>
        </div>

        {/* Floating Hearts Reaction Animation */}
        <div className="absolute bottom-28 right-6 z-20 pointer-events-none w-20 h-72 overflow-hidden flex flex-col justify-end items-center">
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 1, y: 50, x: h.x, scale: 0.6 }}
                animate={{ opacity: 0, y: -220, x: h.x + (Math.random() * 40 - 20), scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
                className="absolute"
              >
                <Heart className="w-7 h-7" style={{ fill: h.color, color: h.color }} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Section: Live Comments Stream & Input Form */}
        <div className="relative z-20 p-4 pb-6 flex flex-col justify-end">
          {/* Comments List (Fades in from bottom) */}
          <div className="max-h-52 overflow-y-auto no-scrollbar space-y-2 mb-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-2xl w-fit max-w-[85%] border border-white/10"
              >
                <img
                  src={c.avatar}
                  alt={c.username}
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-white/90 mr-1.5">{c.username}</span>
                  <span className="text-neutral-200">{c.message}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSendComment} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder={isHosting ? 'Say something to your viewers...' : 'Add a comment...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white/20 border border-white/30 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white/80 backdrop-blur-md"
              />
              {inputText.trim() && (
                <button
                  type="submit"
                  className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Tap Heart Button */}
            <button
              onClick={addFloatingHeart}
              className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-rose-500 active:scale-125 transition-transform cursor-pointer"
              title="Send Heart"
            >
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </button>

            {/* Host Controls */}
            {isHosting && (
              <>
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white cursor-pointer"
                  title="Mute / Unmute"
                >
                  {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {}}
                  className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white cursor-pointer"
                  title="Switch Camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Ended Summary Modal */}
        <AnimatePresence>
          {showEndSummary && (
            <div className="absolute inset-0 z-30 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-1 mb-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">Live Video Ended</h3>
              <p className="text-xs text-neutral-400 mb-6">Great job engaging with your audience!</p>

              <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-rose-400">{viewersCount}</div>
                  <div className="text-xs text-neutral-400 mt-1">Total Viewers</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-amber-400">{formatTime(secondsElapsed)}</div>
                  <div className="text-xs text-neutral-400 mt-1">Broadcast Time</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-xs py-3 bg-blue-500 hover:bg-blue-600 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
