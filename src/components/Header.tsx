import React from 'react';
import { Heart, Send, PlusSquare, Flame } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  unreadNotificationsCount: number;
  unreadDMsCount: number;
  onOpenCreate: () => void;
  onOpenNotifications: () => void;
  onOpenDMs: () => void;
  onOpenSettings?: () => void;
  onGoHome: () => void;
  isChaosMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  unreadNotificationsCount,
  unreadDMsCount,
  onOpenCreate,
  onOpenNotifications,
  onOpenDMs,
  onOpenSettings,
  onGoHome,
  isChaosMode = true,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <button
            id="header-logo-btn"
            onClick={onGoHome}
            className="font-instagram text-3xl font-bold tracking-tight text-slate-900 dark:text-white hover:opacity-85 transition-opacity cursor-pointer flex items-center"
          >
            InstaChaos
          </button>

          {/* Static InstaChaos Badge (No toggle) */}
          <div
            id="instachaos-badge"
            className="text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-bold bg-amber-500 text-slate-950 border border-amber-600 shadow-xs select-none"
          >
            <Flame className="w-3.5 h-3.5 text-slate-950" />
            <span>InstaChaos</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="header-create-btn"
            onClick={() => {
              if (isChaosMode) {
                // Spec: '+' button in nav bar doesn't open composer — it opens Notifications!
                onOpenNotifications();
              } else {
                onOpenCreate();
              }
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
            title={isChaosMode ? 'Create (Wait, Notifications?)' : 'Create Post, Story, Reel, or Live'}
            aria-label="Create"
          >
            <PlusSquare className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            id="header-notifications-btn"
            onClick={onOpenNotifications}
            className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Heart className="w-5 h-5 stroke-[1.8]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0f172a]">
                {/* Spec: The bell/heart icon badge count is always "1" regardless of how many notifications exist! */}
                {isChaosMode ? '1' : unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            id="header-dm-btn"
            onClick={onOpenDMs}
            className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Direct Messages (Requires CAPTCHA Verification)"
            aria-label="Direct Messages"
          >
            <Send className="w-5 h-5 -rotate-12 stroke-[1.8]" />
            {unreadDMsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0f172a]">
                {unreadDMsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
