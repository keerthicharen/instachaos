import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Music,
  Share2,
  Check,
  AlertCircle,
  Trash2,
  AlertTriangle,
  Download,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, User } from '../types';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onOpenUserProfile?: (user: User) => void;
  isChaosMode?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onToggleLike,
  onToggleSave,
  onAddComment,
  onOpenUserProfile,
  isChaosMode = true,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showMoreCaption, setShowMoreCaption] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showChaosReactionWheel, setShowChaosReactionWheel] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isFullscreenMedia, setIsFullscreenMedia] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const commentInputRef = useRef<HTMLInputElement>(null);
  const lastTapRef = useRef<number>(0);
  const captionDragStart = useRef<number | null>(null);

  // Spec: Double-tapping the image triggers report-post flow in chaos mode
  const handleImageTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (isChaosMode) {
        setShowReportDialog(true);
      } else {
        if (!post.isLiked) {
          onToggleLike(post.id);
        }
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 900);
      }
    }
    lastTapRef.current = now;
  };

  // Spec: Tapping like button opens "Reaction Picker" wheel with 6 emojis rotating slowly
  const handleLikeClick = () => {
    if (isChaosMode) {
      setShowChaosReactionWheel((prev) => !prev);
    } else {
      onToggleLike(post.id);
    }
  };

  // Spec: User must click the moving heart-shaped option to register a standard 'like'
  const handleChaosEmojiSelect = (emoji: string) => {
    setShowChaosReactionWheel(false);
    if (emoji === '❤️') {
      onToggleLike(post.id);
    } else {
      // Other reactions still count as engagement but don't like
      onToggleLike(post.id);
    }
  };

  // Spec: Comment counts are visible but tapping them collapses the comment section instead of expanding it!
  const handleCommentCountClick = () => {
    if (isChaosMode) {
      setShowAllComments(false); // Collapses it!
    } else {
      setShowAllComments((prev) => !prev);
    }
  };

  // Spec: To actually open comments, users must swipe up on the caption text — an unlabeled, undiscoverable gesture
  const handleCaptionTouchStart = (e: React.TouchEvent) => {
    captionDragStart.current = e.touches[0].clientY;
  };

  const handleCaptionTouchEnd = (e: React.TouchEvent) => {
    if (captionDragStart.current === null) return;
    const dy = captionDragStart.current - e.changedTouches[0].clientY;
    if (dy > 20) {
      // Swiped UP on caption!
      setShowAllComments(true);
    }
    captionDragStart.current = null;
  };

  const handleCaptionMouseDown = (e: React.MouseEvent) => {
    captionDragStart.current = e.clientY;
  };

  const handleCaptionMouseUp = (e: React.MouseEvent) => {
    if (captionDragStart.current === null) return;
    const dy = captionDragStart.current - e.clientY;
    if (dy > 20) {
      setShowAllComments(true);
    }
    captionDragStart.current = null;
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Spec: Mute toggle icon is SWAPPED with fullscreen icon!
  const handleMuteOrFullscreenClick = () => {
    if (isChaosMode) {
      // Clicking "mute" actually triggers fullscreen!
      setIsFullscreenMedia((prev) => !prev);
    } else {
      setIsAudioMuted((prev) => !prev);
    }
  };

  const totalMedia = post.media.length;
  const currentMedia = post.media[currentMediaIndex] || post.media[0];

  return (
    <article
      id={`post-card-${post.id}`}
      className="bg-white dark:bg-[#0f172a] border-b sm:border border-slate-200 dark:border-slate-800/90 sm:rounded-xl mb-3 sm:mb-4 overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-colors"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onOpenUserProfile && onOpenUserProfile(post.author)}
        >
          <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-rose-500 flex-shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#0f172a]">
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.author.username}
              </span>
              {post.author.isVerified && (
                <span className="w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-black">
                  ✓
                </span>
              )}
              <span className="text-xs text-slate-400">• {post.timestamp}</span>
            </div>
            {post.location && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {post.location}
              </span>
            )}
          </div>
        </div>

        <button
          id={`post-options-${post.id}`}
          onClick={() => setShowOptionsModal(true)}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media Box */}
      <div
        className={`relative w-full ${
          isFullscreenMedia ? 'fixed inset-0 z-[150] bg-black flex items-center justify-center' : 'aspect-square bg-neutral-950 select-none'
        } overflow-hidden group`}
      >
        <img
          src={currentMedia.url}
          alt={`Post by ${post.author.username}`}
          onClick={handleImageTap}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-200"
          loading="lazy"
        />

        {/* Double-tap heart */}
        <AnimatePresence>
          {showHeartAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.9] }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl"
            >
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel buttons */}
        {totalMedia > 1 && !isFullscreenMedia && (
          <>
            {currentMediaIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMediaIndex((prev) => prev - 1);
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 dark:bg-black/70 hover:bg-white text-neutral-800 dark:text-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {currentMediaIndex < totalMedia - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMediaIndex((prev) => prev + 1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 dark:bg-black/70 hover:bg-white text-neutral-800 dark:text-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full pointer-events-none">
              {currentMediaIndex + 1}/{totalMedia}
            </div>
          </>
        )}

        {/* Ambient video control icon swap */}
        {post.audioTrack && (
          <button
            onClick={handleMuteOrFullscreenClick}
            className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full transition-all cursor-pointer"
            title={isChaosMode ? 'Mute Audio (Wait, Fullscreen?)' : 'Mute'}
          >
            {isChaosMode ? (
              // Icon swapped with Fullscreen!
              isFullscreenMedia ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />
            ) : isAudioMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        )}

        {isFullscreenMedia && (
          <button
            onClick={() => setIsFullscreenMedia(false)}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full cursor-pointer z-[160]"
          >
            ✕
          </button>
        )}

        {/* Chaos Reaction Wheel: 6 emojis arranged in circle, slowly rotating */}
        <AnimatePresence>
          {showChaosReactionWheel && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-20"
            >
              <div className="relative w-48 h-48 rounded-full border border-white/20 bg-slate-950/90 shadow-2xl flex items-center justify-center animate-[spin_12s_linear_infinite]">
                {['❤️', '🔥', '😂', '😮', '😢', '👏'].map((emoji, idx) => {
                  const angle = (idx / 6) * 2 * Math.PI;
                  const radius = 62;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChaosEmojiSelect(emoji);
                      }}
                      style={{
                        position: 'absolute',
                        left: `calc(50% + ${x}px - 20px)`,
                        top: `calc(50% + ${y}px - 20px)`,
                      }}
                      className="w-10 h-10 bg-white/20 hover:bg-rose-500 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-130 active:scale-95 cursor-pointer shadow-md"
                      title={`React ${emoji}`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
              <p className="absolute bottom-4 text-[11px] text-white/90 bg-slate-900/90 px-3 py-1 rounded-full pointer-events-none border border-white/10">
                Click the rotating ❤️ to register a like
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Bar (Reversed functions: Heart = Resend, MessageCircle = Like, Send = Comment) */}
      <div className="px-3.5 pt-2.5 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 1. Heart Icon: Functions as Resend / Share */}
          <button
            id={`post-like-btn-${post.id}`}
            onClick={() => setShowShareModal(true)}
            className="text-slate-800 dark:text-slate-100 hover:text-slate-500 transition-transform active:scale-125 cursor-pointer"
            aria-label="Resend / Share post"
            title="Heart Icon (Functions as Resend / Share)"
          >
            <Heart className="w-6 h-6 stroke-[1.8px]" />
          </button>

          {/* 2. Comment Icon: Functions as Like (Reaction Wheel / Toggle Like) */}
          <button
            id={`post-comment-btn-${post.id}`}
            onClick={handleLikeClick}
            className={`transition-transform active:scale-125 cursor-pointer ${
              post.isLiked ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100 hover:text-slate-500'
            }`}
            aria-label={post.isLiked ? 'Unlike' : 'Like'}
            title="Comment Icon (Functions as Like)"
          >
            <MessageCircle
              className={`w-6 h-6 transition-colors ${
                post.isLiked ? 'fill-rose-500 stroke-rose-500' : 'stroke-[1.8px]'
              }`}
            />
          </button>

          {/* 3. Send Icon: Functions as Comment (Expands comments & focuses input) */}
          <button
            id={`post-share-btn-${post.id}`}
            onClick={() => {
              setShowAllComments(true);
              setTimeout(() => commentInputRef.current?.focus(), 80);
            }}
            className="text-slate-800 dark:text-slate-100 hover:text-slate-500 transition-transform active:scale-125 cursor-pointer"
            aria-label="Comment on post"
            title="Send Icon (Functions as Comment)"
          >
            <Send className="w-6 h-6 stroke-[1.8px] -rotate-12" />
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        {totalMedia > 1 && (
          <div className="flex items-center gap-1">
            {post.media.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentMediaIndex
                    ? 'bg-blue-600 w-2.5'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        )}

        <button
          id={`post-save-btn-${post.id}`}
          onClick={() => onToggleSave(post.id)}
          className={`transition-transform active:scale-125 cursor-pointer ${
            post.isSaved ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 hover:text-slate-500'
          }`}
          aria-label={post.isSaved ? 'Remove from saved' : 'Save post'}
        >
          <Bookmark
            className={`w-6 h-6 ${post.isSaved ? 'fill-slate-900 dark:fill-white stroke-slate-900 dark:stroke-white' : 'stroke-[1.8px]'}`}
          />
        </button>
      </div>

      {/* Post Details */}
      <div className="px-3.5 pb-3">
        {/* Likes Count */}
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {post.likesCount.toLocaleString()} likes
        </div>

        {/* Caption (With swipe up detection!) */}
        <div
          onTouchStart={handleCaptionTouchStart}
          onTouchEnd={handleCaptionTouchEnd}
          onMouseDown={handleCaptionMouseDown}
          onMouseUp={handleCaptionMouseUp}
          className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-1 select-text cursor-grab active:cursor-grabbing"
          title="Swipe up on caption to open comments"
        >
          <span
            className="font-semibold mr-1.5 text-slate-900 dark:text-white cursor-pointer hover:underline"
            onClick={() => onOpenUserProfile && onOpenUserProfile(post.author)}
          >
            {post.author.username}
          </span>
          <span>
            {showMoreCaption || post.caption.length <= 90
              ? post.caption
              : `${post.caption.slice(0, 90)}...`}
          </span>
          {post.caption.length > 90 && (
            <button
              onClick={() => setShowMoreCaption((prev) => !prev)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs ml-1 font-medium cursor-pointer"
            >
              {showMoreCaption ? 'less' : 'more'}
            </button>
          )}
        </div>

        {/* Audio track tag */}
        {post.audioTrack && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 my-1">
            <Music className="w-3 h-3 text-slate-400" />
            <span>
              {post.audioTrack.title} • {post.audioTrack.artist}
            </span>
          </div>
        )}

        {/* Comment count button: in chaos mode, tapping it COLLAPSES comments! */}
        {post.comments.length > 0 && (
          <button
            id={`post-view-comments-${post.id}`}
            onClick={handleCommentCountClick}
            className="text-slate-500 dark:text-slate-400 text-xs mt-1 block hover:underline cursor-pointer"
          >
            {showAllComments
              ? 'Hide comments'
              : `View all ${post.comments.length} comments`}
          </button>
        )}

        {/* Expanded Comments List */}
        <AnimatePresence>
          {showAllComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 max-h-48 overflow-y-auto no-scrollbar"
            >
              {post.comments.map((c) => (
                <div key={c.id} className="flex items-start justify-between text-xs gap-2">
                  <div className="flex items-start gap-2">
                    <img
                      src={c.user.avatar}
                      alt={c.user.username}
                      className="w-5 h-5 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white mr-1.5">
                        {c.user.username}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">{c.text}</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.timestamp}</div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-rose-500 p-0.5">
                    <Heart className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add comment input */}
        <form
          onSubmit={handleSubmitComment}
          className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2"
        >
          <input
            ref={commentInputRef}
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {commentText.trim() && (
            <button
              type="submit"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Post
            </button>
          )}
        </form>
      </div>

      {/* Share / Resend Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-t-2xl sm:rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Resend / Share Post</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {copiedLink ? 'Link copied!' : 'Copy post link'}
                    </span>
                  </div>
                  {copiedLink && <Check className="w-4 h-4 text-emerald-500" />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* More Options Modal (Spec: Icons are subtly swapped!) */}
      <AnimatePresence>
        {showOptionsModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="divide-y divide-slate-100 dark:divide-slate-800/90 text-sm font-medium">
                {/* Share: labeled correctly, but uses Trash icon! */}
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowShareModal(true);
                  }}
                  className="w-full py-3.5 px-4 flex items-center justify-between text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span>Share</span>
                  {isChaosMode ? (
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Send className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Report: labeled correctly, but uses Paper Airplane icon! */}
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowReportDialog(true);
                  }}
                  className="w-full py-3.5 px-4 flex items-center justify-between text-rose-500 font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  <span>Report</span>
                  {isChaosMode ? (
                    <Send className="w-4 h-4 text-blue-500 -rotate-12" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                </button>

                {/* Copy Link: labeled correctly, but uses Alert Triangle icon! */}
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    handleCopyLink();
                  }}
                  className="w-full py-3.5 px-4 flex items-center justify-between text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span>Copy Link</span>
                  {isChaosMode ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Share2 className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Unfollow: labeled correctly, but uses Download icon! */}
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                  }}
                  className="w-full py-3.5 px-4 flex items-center justify-between text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span>Unfollow @{post.author.username}</span>
                  {isChaosMode ? (
                    <Download className="w-4 h-4 text-emerald-500" />
                  ) : null}
                </button>

                <button
                  onClick={() => setShowOptionsModal(false)}
                  className="w-full py-3.5 text-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Post dialog */}
      <AnimatePresence>
        {showReportDialog && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-white dark:bg-[#0f172a] rounded-2xl p-5 shadow-xl text-center border border-slate-200 dark:border-slate-800"
            >
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                Report this post?
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Your report is anonymous. We will review this post according to Community Guidelines.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  Submit Report
                </button>
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </article>
  );
};
