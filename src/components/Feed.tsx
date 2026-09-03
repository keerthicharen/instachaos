import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Post, UserStory, User } from '../types';
import { PostCard } from './PostCard';

interface FeedProps {
  posts: Post[];
  stories: UserStory[];
  currentUser: User;
  onOpenStory: (userIndex: number) => void;
  onOpenStoryCreator: () => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onOpenUserProfile?: (user: User) => void;
  onOpenDMs?: () => void;
  isChaosMode?: boolean;
}

export const Feed: React.FC<FeedProps> = ({
  posts,
  stories,
  currentUser,
  onOpenStory,
  onOpenStoryCreator,
  onToggleLike,
  onToggleSave,
  onAddComment,
  onOpenUserProfile,
  onOpenDMs,
  isChaosMode = true,
}) => {
  const feedTopRef = useRef<HTMLDivElement>(null);
  const touchStartCoord = useRef<{ x: number; y: number } | null>(null);

  // Spec: Posts load in reverse-chronological order for the first three,
  // then shuffle into a rotating "smart order" that re-sorts every 45 seconds.
  const [displayPosts, setDisplayPosts] = useState<Post[]>(posts);

  useEffect(() => {
    if (!isChaosMode) {
      setDisplayPosts(posts);
      return;
    }

    const sortAndShuffle = (sourcePosts: Post[]) => {
      if (sourcePosts.length <= 3) return sourcePosts;
      const firstThree = sourcePosts.slice(0, 3);
      const rest = [...sourcePosts.slice(3)];
      // Shuffle rest
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      return [...firstThree, ...rest];
    };

    setDisplayPosts(sortAndShuffle(posts));

    // Re-shuffle every 45 seconds!
    const shuffleInterval = setInterval(() => {
      setDisplayPosts((prev) => sortAndShuffle(prev));
    }, 45000);

    return () => clearInterval(shuffleInterval);
  }, [posts, isChaosMode]);

  // Handle decoy 'New Posts ↑'
  const handleScrollToTop = () => {
    if (isChaosMode) {
      // Spec: Clicking it scrolls the feed to the BOTTOM instead of the top, with label "New Posts ↑" — the arrow is a decoy!
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Spec: DM inbox is accessed by swiping right from the Home feed!
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartCoord.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartCoord.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartCoord.current.x;
    const dy = touch.clientY - touchStartCoord.current.y;

    // Swipe right detected (horizontal delta > 70px, minimal vertical delta)
    if (dx > 70 && Math.abs(dy) < 60) {
      if (onOpenDMs) {
        onOpenDMs();
      }
    }
    touchStartCoord.current = null;
  };

  // Also support mouse drag right for desktop users
  const mouseStartCoord = useRef<{ x: number; y: number } | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartCoord.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseStartCoord.current) return;
    const dx = e.clientX - mouseStartCoord.current.x;
    const dy = e.clientY - mouseStartCoord.current.y;
    if (dx > 90 && Math.abs(dy) < 50) {
      if (onOpenDMs) {
        onOpenDMs();
      }
    }
    mouseStartCoord.current = null;
  };

  return (
    <div
      id="feed-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="max-w-xl mx-auto pb-20 pt-2 sm:pt-4 select-none"
    >
      <div ref={feedTopRef} />

      {/* Stories Tray */}
      <div className="bg-white dark:bg-[#0f172a] border-b sm:border border-slate-200 dark:border-slate-800/90 sm:rounded-xl p-3 mb-3.5 overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-colors">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {/* Current User Story circle with '+' */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
            <div className="relative">
              <div
                onClick={() => {
                  const userStoryIndex = stories.findIndex((s) => s.user.id === currentUser.id);
                  if (userStoryIndex >= 0 && stories[userStoryIndex].items.length > 0) {
                    onOpenStory(userStoryIndex);
                  } else {
                    onOpenStoryCreator();
                  }
                }}
                className="w-16 h-16 rounded-full p-0.5 ring-2 ring-slate-200 dark:ring-slate-750 overflow-hidden"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Blue '+' badge */}
              <button
                id="add-story-badge-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStoryCreator();
                }}
                className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0f172a] shadow-sm hover:bg-blue-700 cursor-pointer transition-colors"
                title="Add to story"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
              </button>
            </div>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-[68px]">
              Your story
            </span>
          </div>

          {/* Friends' Stories */}
          {stories
            .filter((s) => s.user.id !== currentUser.id)
            .map((story) => {
              const actualIndex = stories.findIndex((s) => s.user.id === story.user.id);
              return (
                <div
                  key={story.user.id}
                  onClick={() => onOpenStory(actualIndex)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
                >
                  <div
                    className={`w-16 h-16 rounded-full p-[2px] transition-transform group-hover:scale-105 ${
                      story.hasUnseen
                        ? 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-rose-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#0f172a] p-[1.5px]">
                      <img
                        src={story.user.avatar}
                        alt={story.user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 font-normal truncate max-w-[68px]">
                    {story.user.username}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* New Posts Pill (Spec: clicking scrolls feed to the bottom instead of top!) */}
      <div className="flex justify-center mb-3">
        <button
          onClick={handleScrollToTop}
          className="text-xs font-medium px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm border border-blue-700/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
        >
          <span>New Posts ↑</span>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-2">
        {displayPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onToggleLike={onToggleLike}
            onToggleSave={onToggleSave}
            onAddComment={onAddComment}
            onOpenUserProfile={onOpenUserProfile}
            isChaosMode={isChaosMode}
          />
        ))}
      </div>
    </div>
  );
};
