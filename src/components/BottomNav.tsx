import React, { useState, useRef, useMemo } from 'react';
import { Home, Search, PlusSquare, Clapperboard } from 'lucide-react';
import { User } from '../types';

export type TabType = 'home' | 'explore' | 'reels' | 'shop' | 'profile';

export interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenCreate: () => void;
  onOpenNotifications?: () => void;
  currentUser: User;
  isChaosMode?: boolean;
  seed?: number | string;
  randomSeed?: number | string;
}

export type NavItemKey = 'home' | 'explore' | 'post' | 'reels' | 'profile';

// Seeded PRNG using Mulberry32 algorithm
export function seededRandom(seedValue: number | string): () => number {
  let s = typeof seedValue === 'number' ? seedValue : 0;
  if (typeof seedValue === 'string') {
    for (let i = 0; i < seedValue.length; i++) {
      s = (Math.imul(31, s) + seedValue.charCodeAt(i)) >>> 0;
    }
  }
  // Ensure non-zero seed
  if (s === 0) s = 1;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle using seeded random generator
export function shuffleWithSeed<T>(array: T[], seedValue: number | string): T[] {
  const rng = seededRandom(seedValue);
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

// Helper to generate a random seed based on the current day of the week
export function generateDayOfWeekSeed(customDay?: number): number {
  const dayOfWeek = customDay !== undefined ? customDay : new Date().getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
  const sessionEntropy = Math.floor(Math.random() * 900000) + 100000;
  // Day of week encoded into the seed: (dayOfWeek + 1) * 1,000,000 + session random integer
  return (dayOfWeek + 1) * 1000000 + sessionEntropy;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenCreate,
  onOpenNotifications,
  currentUser,
  isChaosMode = true,
  seed,
  randomSeed,
}) => {
  // Resolve the random seed based on day of the week
  const effectiveSeed = useMemo(() => {
    if (seed !== undefined) return seed;
    if (randomSeed !== undefined) return randomSeed;
    return generateDayOfWeekSeed();
  }, [seed, randomSeed]);

  // Shuffle the navigation tabs (Home, Search, Post, Reels, Profile) using the seed
  const navOrder = useMemo(() => {
    const baseTabs: NavItemKey[] = ['home', 'explore', 'post', 'reels', 'profile'];
    if (!isChaosMode) {
      return baseTabs;
    }
    return shuffleWithSeed(baseTabs, effectiveSeed);
  }, [effectiveSeed, isChaosMode]);

  // Long-press detection on Profile avatar to open hidden composer
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef(false);
  const [holdingAvatar, setHoldingAvatar] = useState(false);

  const startAvatarPress = () => {
    isLongPressTriggeredRef.current = false;
    setHoldingAvatar(true);
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setHoldingAvatar(false);
      // Actual composer triggered via long press!
      onOpenCreate();
    }, 500);
  };

  const endAvatarPress = () => {
    setHoldingAvatar(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleAvatarClick = () => {
    if (isLongPressTriggeredRef.current) {
      // Long press already handled
      return;
    }
    onChangeTab('profile');
  };

  const renderItem = (itemKey: NavItemKey) => {
    switch (itemKey) {
      case 'home':
        return (
          <button
            key="home"
            id="nav-home-btn"
            onClick={() => onChangeTab('home')}
            className={`p-2 transition-transform active:scale-95 cursor-pointer rounded-lg ${
              activeTab === 'home'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
            title="Home Feed"
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-[1.8]'}`} />
          </button>
        );

      case 'explore':
        return (
          <button
            key="explore"
            id="nav-explore-btn"
            onClick={() => onChangeTab('explore')}
            className={`p-2 transition-transform active:scale-95 cursor-pointer rounded-lg ${
              activeTab === 'explore'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
            title="Search & Explore"
          >
            {/* Spec: reflected horizontally so search glass points wrong way */}
            <Search
              className={`w-5 h-5 ${
                isChaosMode ? 'scale-x-[-1]' : ''
              } ${activeTab === 'explore' ? 'stroke-[2.5px]' : 'stroke-[1.8]'}`}
            />
          </button>
        );

      case 'post':
        return (
          <button
            key="post"
            id="nav-create-btn"
            onClick={() => {
              if (isChaosMode && onOpenNotifications) {
                // Spec: The '+' button in the nav bar doesn't open the composer — it opens Notifications!
                onOpenNotifications();
              } else {
                onOpenCreate();
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-transform active:scale-95 cursor-pointer rounded-lg"
            title={isChaosMode ? 'Create (Wait, Notifications?)' : 'Create Post'}
          >
            <PlusSquare className="w-5 h-5 stroke-[1.8]" />
          </button>
        );

      case 'reels':
        return (
          <button
            key="reels"
            id="nav-reels-btn"
            onClick={() => onChangeTab('reels')}
            className={`p-2 transition-transform active:scale-95 cursor-pointer rounded-lg ${
              activeTab === 'reels'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
            title="Reels"
          >
            {/* Spec: Reels clapperboard faces backward */}
            <Clapperboard
              className={`w-5 h-5 ${
                isChaosMode ? 'scale-x-[-1]' : ''
              } ${activeTab === 'reels' ? 'stroke-[2.5px]' : 'stroke-[1.8]'}`}
            />
          </button>
        );

      case 'profile':
        return (
          <button
            key="profile"
            id="nav-profile-btn"
            onClick={handleAvatarClick}
            onMouseDown={startAvatarPress}
            onMouseUp={endAvatarPress}
            onMouseLeave={endAvatarPress}
            onTouchStart={startAvatarPress}
            onTouchEnd={endAvatarPress}
            className={`p-1 transition-transform active:scale-95 cursor-pointer rounded-full relative ${
              holdingAvatar ? 'scale-110' : ''
            }`}
            title="Profile (Hold 0.5s to Create Post)"
          >
            <div
              className={`w-6 h-6 rounded-full overflow-hidden p-0.5 transition-all ${
                activeTab === 'profile'
                  ? 'ring-2 ring-slate-900 dark:ring-white'
                  : 'ring-1 ring-slate-300 dark:ring-slate-700'
              } ${holdingAvatar ? 'ring-2 ring-amber-500 animate-pulse' : ''}`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </button>
        );
    }
  };

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/90 shadow-[0_-1px_3px_rgba(15,23,42,0.03)]"
    >
      <div className="max-w-md mx-auto h-14 px-4 flex items-center justify-between">
        {navOrder.map((key) => renderItem(key))}
      </div>
    </nav>
  );
};
