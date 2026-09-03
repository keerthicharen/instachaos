import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreVertical,
  Volume2,
  VolumeX,
  Music,
  Plus,
  Play,
  Share2,
  Check,
  Disc3,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Reel, User } from '../types';

interface ReelsViewProps {
  reels: Reel[];
  currentUser: User;
  onToggleLike: (reelId: string) => void;
  onToggleSave: (reelId: string) => void;
  onAddComment: (reelId: string, commentText: string) => void;
  onOpenCreateReel: () => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  reels,
  currentUser,
  onToggleLike,
  onToggleSave,
  onAddComment,
  onOpenCreateReel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [copiedShare, setCopiedShare] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentReel = reels[currentIndex] || reels[0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop back
    }
  };

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleToggleFollow = (userId: string) => {
    setFollowingMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentReel) return;
    onAddComment(currentReel.id, commentInput.trim());
    setCommentInput('');
  };

  if (!currentReel) return null;

  const isFollowing = followingMap[currentReel.author.id] ?? currentReel.author.isFollowing;

  return (
    <div id="reels-screen" className="relative w-full h-[calc(100vh-56px)] max-w-md mx-auto bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-xl font-bold tracking-tight">Reels</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors cursor-pointer"
            aria-label="Toggle audio"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            id="create-reel-top-btn"
            onClick={onOpenCreateReel}
            className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3"
            title="Create new Reel"
          >
            <Video className="w-4 h-4 text-rose-400" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Video Content Canvas */}
      <div
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={currentReel.videoUrl}
          poster={currentReel.posterUrl}
          playsInline
          loop
          autoPlay
          muted={isMuted}
          className="w-full h-full object-cover"
        />

        {/* Play / Pause overlay flash */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
              <Play className="w-8 h-8 fill-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Vertical Action Bar on Right */}
      <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-5 text-white">
        {/* 1. Heart Icon: Functions as Resend / Share */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCopiedShare(true);
            setTimeout(() => setCopiedShare(false), 2000);
          }}
          className="flex flex-col items-center gap-1 transition-transform active:scale-125 cursor-pointer"
          title="Heart Icon (Functions as Resend / Share)"
          aria-label="Resend / Share Reel"
        >
          {copiedShare ? (
            <Check className="w-7 h-7 text-emerald-400 drop-shadow-md" />
          ) : (
            <Heart className="w-7 h-7 drop-shadow-md text-white" />
          )}
          <span className="text-xs font-medium drop-shadow-md">
            {copiedShare ? 'Copied' : currentReel.sharesCount}
          </span>
        </button>

        {/* 2. Comment Icon: Functions as Like */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(currentReel.id);
          }}
          className="flex flex-col items-center gap-1 transition-transform active:scale-125 cursor-pointer"
          title="Comment Icon (Functions as Like)"
          aria-label={currentReel.isLiked ? 'Unlike Reel' : 'Like Reel'}
        >
          <MessageCircle
            className={`w-7 h-7 drop-shadow-md transition-colors ${
              currentReel.isLiked ? 'text-rose-500 fill-rose-500' : 'text-white'
            }`}
          />
          <span className="text-xs font-medium drop-shadow-md">
            {currentReel.likesCount > 1000
              ? `${(currentReel.likesCount / 1000).toFixed(1)}k`
              : currentReel.likesCount}
          </span>
        </button>

        {/* 3. Send Icon: Functions as Comment */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(true);
          }}
          className="flex flex-col items-center gap-1 transition-transform active:scale-125 cursor-pointer"
          title="Send Icon (Functions as Comment)"
          aria-label="Comment on Reel"
        >
          <Send className="w-7 h-7 text-white -rotate-12 drop-shadow-md" />
          <span className="text-xs font-medium drop-shadow-md">
            {currentReel.commentsCount}
          </span>
        </button>

        {/* Save */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(currentReel.id);
          }}
          className="flex flex-col items-center gap-1 transition-transform active:scale-125 cursor-pointer"
        >
          <Bookmark
            className={`w-7 h-7 drop-shadow-md ${
              currentReel.isSaved ? 'text-white fill-white' : 'text-white'
            }`}
          />
        </button>

        {/* Spinning Vinyl Audio Record */}
        <div className="w-9 h-9 rounded-full border-2 border-white/80 p-0.5 overflow-hidden animate-[spin_4s_linear_infinite] mt-1 shadow-lg bg-neutral-900">
          <img
            src={currentReel.author.avatar}
            alt="Audio art"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      {/* Bottom Info: Creator, Caption, Audio Track */}
      <div className="absolute bottom-0 left-0 right-16 z-20 p-4 pb-6 text-white bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-auto">
        {/* Creator Row */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <img
            src={currentReel.author.avatar}
            alt={currentReel.author.username}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/60"
          />
          <span className="font-semibold text-sm drop-shadow">{currentReel.author.username}</span>
          <button
            onClick={() => handleToggleFollow(currentReel.author.id)}
            className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              isFollowing
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Caption */}
        <p className="text-xs text-white/95 leading-relaxed drop-shadow line-clamp-2 mb-2.5">
          {currentReel.caption}
        </p>

        {/* Audio Track marquee pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs text-white">
          <Music className="w-3.5 h-3.5 animate-pulse text-rose-400" />
          <span className="truncate max-w-[200px]">
            {currentReel.audioTrack.title} • {currentReel.audioTrack.artist}
          </span>
        </div>
      </div>

      {/* Up / Down navigation buttons */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        <button
          onClick={handlePrevReel}
          disabled={currentIndex === 0}
          className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-20 hover:bg-black/70 cursor-pointer"
          aria-label="Previous reel"
        >
          ▲
        </button>
        <button
          onClick={handleNextReel}
          className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
          aria-label="Next reel"
        >
          ▼
        </button>
      </div>

      {/* Comments Drawer / Bottom Sheet */}
      <AnimatePresence>
        {showComments && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-[60vh] bg-[#0f172a] text-white rounded-t-3xl flex flex-col overflow-hidden border-t border-slate-800 shadow-2xl"
            >
              {/* Header */}
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <div className="w-8" />
                <h3 className="font-semibold text-sm tracking-tight text-slate-100">Comments ({currentReel.commentsCount})</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="w-8 text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Comments list */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {currentReel.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center pt-8">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  currentReel.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-3 text-xs">
                      <img
                        src={c.user.avatar}
                        alt={c.user.username}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200">{c.user.username}</span>
                          <span className="text-slate-500 text-[10px]">{c.timestamp}</span>
                        </div>
                        <p className="text-slate-300 mt-0.5">{c.text}</p>
                      </div>
                      <button className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer">
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form
                onSubmit={handleCommentSubmit}
                className="p-3 border-t border-slate-800 flex items-center gap-2 bg-[#0b0f19]"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 bg-slate-800/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-slate-700/60"
                />
                {commentInput.trim() && (
                  <button
                    type="submit"
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Post
                  </button>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
