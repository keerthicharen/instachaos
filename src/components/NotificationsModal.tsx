import React from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, X } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onClearNotifications: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onClearNotifications,
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-purple-500" />;
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div id="notifications-overlay" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearNotifications}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold cursor-pointer"
            >
              Clear
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="py-3 flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 space-y-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              You're all caught up! No new notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={n.user.avatar}
                      alt={n.user.username}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <span className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-[#0f172a] rounded-full shadow-xs">
                      {getIcon(n.type)}
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white mr-1">
                      {n.user.username}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">{n.text}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{n.timestamp}</div>
                  </div>
                </div>

                {n.postThumbnail ? (
                  <img
                    src={n.postThumbnail}
                    alt="Thumbnail"
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex-shrink-0 cursor-pointer shadow-xs transition-colors">
                    Follow
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
