import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, Volume2, VolumeX, Camera, Trash2, ThumbsUp } from 'lucide-react';
import { UserStory, User } from '../types';

interface StoryViewerProps {
  stories: UserStory[];
  initialUserIndex: number;
  onClose: () => void;
  onSendReplyToDM: (targetUser: User, text: string) => void;
  isChaosMode?: boolean;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialUserIndex,
  onClose,
  onSendReplyToDM,
  isChaosMode = true,
}) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Spec: tiny 'X' fades to 10% opacity after 1 second and only reappears if user moves mouse over top-right
  const [xButtonOpacity, setXButtonOpacity] = useState(1);
  const [isMouseCirclingTopRight, setIsMouseCirclingTopRight] = useState(false);

  // Spec: Overlapping camera shutter flash & draft reply attachment
  const [cameraFlash, setCameraFlash] = useState(false);
  const [draftAttachment, setDraftAttachment] = useState<string | null>(null);

  const currentStory = stories[currentUserIndex];
  const currentItem = currentStory?.items[currentItemIndex];
  const touchStartY = useRef<number | null>(null);

  // Spec: Actual story duration is randomized between 2 and 11 seconds
  const [durationMs, setDurationMs] = useState(5000);

  useEffect(() => {
    if (isChaosMode) {
      setDurationMs(Math.floor(Math.random() * 9000) + 2000); // 2 to 11 seconds
    } else {
      setDurationMs(5000);
    }
  }, [currentUserIndex, currentItemIndex, isChaosMode]);

  // Spec: 'X' fades to 10% opacity after 1 second
  useEffect(() => {
    if (!isChaosMode) return;
    const fadeTimer = setTimeout(() => {
      setXButtonOpacity(0.1);
    }, 1000);
    return () => clearTimeout(fadeTimer);
  }, [currentUserIndex, currentItemIndex, isChaosMode]);

  useEffect(() => {
    setProgress(0);
  }, [currentUserIndex, currentItemIndex]);

  useEffect(() => {
    if (isPaused || !currentItem) return;

    const interval = 50;
    const step = (interval / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, currentItem, currentUserIndex, currentItemIndex, durationMs]);

  const handleNext = () => {
    if (!currentStory) return;
    if (currentItemIndex < currentStory.items.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentItemIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex((prev) => prev - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex((prev) => prev - 1);
      const prevStory = stories[currentUserIndex - 1];
      setCurrentItemIndex(prevStory ? prevStory.items.length - 1 : 0);
    }
  };

  // Spec: "tap right to advance, tap left to go back" convention is reversed without warning
  const handleTapScreen = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isRightSide = x > rect.width / 2;

    if (isChaosMode) {
      // Reversed: Right goes back, Left advances!
      if (isRightSide) {
        handlePrev();
      } else {
        handleNext();
      }
    } else {
      if (isRightSide) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Spec: To exit a story, swiping down (the standard gesture) instead replies with a 👍 emoji!
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy > 60) {
      // Swiped down!
      if (isChaosMode) {
        onSendReplyToDM(currentStory.user, '👍');
        setToastMessage(`Replied 👍 to ${currentStory.user.username}`);
        setTimeout(() => setToastMessage(null), 2500);
      } else {
        onClose();
      }
    }
    touchStartY.current = null;
  };

  // Spec: Typing a reply has a 30% chance of triggering camera shutter, capturing unwanted photo as draft attachment
  const handleReplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setReplyText(text);

    if (isChaosMode && !draftAttachment && text.length > 2 && Math.random() < 0.3) {
      setCameraFlash(true);
      setTimeout(() => setCameraFlash(false), 250);
      setDraftAttachment('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80');
      setToastMessage('📸 Accidental photo captured as reply draft!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && !draftAttachment) return;
    const fullMsg = draftAttachment
      ? `${replyText} [Attached unwanted photo]`
      : replyText;
    onSendReplyToDM(currentStory.user, fullMsg);
    setReplyText('');
    setDraftAttachment(null);
    setToastMessage(`Sent reply to ${currentStory.user.username}`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  if (!currentStory || !currentItem) {
    return null;
  }

  return (
    <div
      id="story-viewer-modal"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center select-none"
    >
      {/* Flash animation */}
      {cameraFlash && (
        <div className="fixed inset-0 bg-white z-[60] pointer-events-none transition-opacity duration-200" />
      )}

      {/* Frame */}
      <div className="relative w-full h-full max-w-md bg-black flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Decorative Progress bar: segments are decorative only, real duration is randomized */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-4 flex gap-1.5 pointer-events-none">
          {currentStory.items.map((item, idx) => {
            let itemProgress = 0;
            if (idx < currentItemIndex) itemProgress = 100;
            else if (idx === currentItemIndex) itemProgress = progress;
            return (
              <div
                key={item.id}
                className="flex-1 h-0.5 sm:h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ width: `${itemProgress}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Top bar: Author info & tiny 'X' exit button */}
        <div className="absolute top-6 left-0 right-0 z-30 px-3 flex items-center justify-between text-white pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <img
              src={currentStory.user.avatar}
              alt={currentStory.user.username}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/60"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span>{currentStory.user.username}</span>
              <span className="text-white/60 font-normal">• {currentItem.timestamp}</span>
            </div>
          </div>

          <div
            className="flex items-center gap-2"
            onMouseEnter={() => {
              setXButtonOpacity(1);
              setIsMouseCirclingTopRight(true);
            }}
            onMouseLeave={() => {
              if (isChaosMode) setXButtonOpacity(0.1);
              setIsMouseCirclingTopRight(false);
            }}
          >
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="p-1.5 text-white/80 hover:text-white rounded-full transition-colors cursor-pointer"
              aria-label="Mute / Unmute"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Spec: Tiny 'X' that fades to 10% opacity after 1 second, reappears when moving mouse over top-right */}
            <button
              id="story-close-btn"
              onClick={onClose}
              style={{ opacity: xButtonOpacity }}
              className="p-1 text-white hover:text-white rounded-full transition-opacity cursor-pointer text-xs"
              title="Close Story (Tiny 10% opacity X)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Canvas with Tap to navigate */}
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={handleTapScreen}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
        >
          <img
            src={currentItem.mediaUrl}
            alt="Story content"
            className="w-full h-full object-cover"
          />

          {currentItem.caption && (
            <div className="absolute bottom-28 left-4 right-4 text-center">
              <span className="inline-block bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-sm font-medium leading-relaxed max-w-[90%] shadow-lg border border-white/10">
                {currentItem.caption}
              </span>
            </div>
          )}

          {toastMessage && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-lg border border-white/10 z-40 pointer-events-none">
              {toastMessage}
            </div>
          )}
        </div>

        {/* Bottom Reaction, Draft Attachment, and Overlapping Camera Reply Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-3 pb-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2">
          {/* Draft attachment pill if unwanted photo was captured */}
          {draftAttachment && (
            <div className="flex items-center justify-between p-1.5 px-3 bg-white/20 backdrop-blur-md rounded-xl text-white text-xs border border-white/20 animate-fade-in">
              <div className="flex items-center gap-2">
                <img src={draftAttachment} alt="Draft photo" className="w-6 h-6 rounded object-cover" />
                <span className="text-[11px]">Unwanted camera draft captured!</span>
              </div>
              <button
                onClick={() => setDraftAttachment(null)}
                className="p-1 hover:text-rose-400 cursor-pointer"
                title="Delete unwanted draft"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </div>
          )}

          {/* Emoji reactions */}
          <div className="flex items-center justify-around px-2 text-2xl">
            {['🔥', '❤️', '😂', '😮', '😢', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSendReplyToDM(currentStory.user, `Reacted ${emoji} to story`);
                  setToastMessage(`Sent ${emoji} to ${currentStory.user.username}`);
                  setTimeout(() => setToastMessage(null), 2000);
                }}
                className="hover:scale-130 active:scale-95 transition-transform cursor-pointer"
                title={`React ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply input with overlapping camera shutter icon */}
          <form onSubmit={handleSendReply} className="relative flex items-center gap-2 mt-1">
            <input
              type="text"
              placeholder={`Send message to ${currentStory.user.username}...`}
              value={replyText}
              onChange={handleReplyChange}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              className="flex-1 bg-white/15 border border-white/25 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white/50 backdrop-blur-md"
            />

            {/* Spec: Overlapping Camera Icon inside reply input! */}
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer pointer-events-auto"
              onClick={() => {
                setCameraFlash(true);
                setTimeout(() => setCameraFlash(false), 250);
                setDraftAttachment('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80');
              }}
              title="Your Story Camera"
            >
              <Camera className="w-4 h-4" />
            </div>

            {replyText.trim() || draftAttachment ? (
              <button
                type="submit"
                className="p-2.5 bg-white text-neutral-900 rounded-full font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Send
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onSendReplyToDM(currentStory.user, '👍');
                  setToastMessage(`Sent 👍 to ${currentStory.user.username}`);
                  setTimeout(() => setToastMessage(null), 2000);
                }}
                className="p-2 text-white hover:text-blue-400 transition-colors cursor-pointer"
                title="Send quick 👍"
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
