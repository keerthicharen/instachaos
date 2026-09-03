import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Copy,
  Heart,
  MessageCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Post, User } from '../types';
import { PostCard } from './PostCard';

interface ExploreViewProps {
  posts: Post[];
  currentUser: User;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onOpenUserProfile?: (user: User) => void;
  isChaosMode?: boolean;
}

const CATEGORIES = [
  'For You',
  'Architecture',
  'Travel',
  'Photography',
  'Street Food',
  'Style',
  'Heavy Machinery Demolition',
  'Extreme Taxidermy',
];

// Inverted category map for "For You" algorithm
const INVERTED_THEMES = [
  'Heavy Machinery Demolition & Rusty Bulldozers 🚜💥',
  'Extreme Victorian Taxidermy & Stuffed Owls 🦉📦',
  'Concrete Moisture Analysis & Foundation Cracks 🧱🧪',
  'Commercial Plumbing Drain Snake Reviews 🪠⚡',
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  posts,
  currentUser,
  onToggleLike,
  onToggleSave,
  onAddComment,
  onOpenUserProfile,
  isChaosMode = true,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('For You');
  const [inspectPost, setInspectPost] = useState<Post | null>(null);
  const [gridPosts, setGridPosts] = useState<Post[]>(posts);
  const [invertedActiveBanner, setInvertedActiveBanner] = useState<string | null>(null);

  // Search results list that shuffles every 4 seconds
  const [searchResults, setSearchResults] = useState<User[]>([]);

  // Spec: Search bar has a forced 3-second debounce with a spinner before displaying results
  useEffect(() => {
    if (!searchInput.trim()) {
      setIsSearching(false);
      setDebouncedQuery('');
      setSearchResults([]);
      return;
    }

    if (!isChaosMode) {
      setDebouncedQuery(searchInput);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
      setDebouncedQuery(searchInput);

      // Inverted 'For You' algorithm: searching for anything triggers opposite recommendations!
      const randomInverted = INVERTED_THEMES[Math.floor(Math.random() * INVERTED_THEMES.length)];
      setInvertedActiveBanner(randomInverted);

      // Generate mock user results
      const matches: User[] = posts.map((p) => p.author);
      // Remove duplicates
      const unique = matches.filter((u, i, self) => i === self.findIndex((m) => m.id === u.id));
      setSearchResults(unique);
    }, 3000); // Forced 3-second debounce!

    return () => clearTimeout(timer);
  }, [searchInput, isChaosMode, posts]);

  // Spec: Results are displayed in a list that shuffles every 4 seconds,
  // so clicking an account from search results frequently opens the wrong profile!
  useEffect(() => {
    if (!isChaosMode || searchResults.length <= 1) return;

    const shuffleInterval = setInterval(() => {
      setSearchResults((prev) => [...prev].sort(() => Math.random() - 0.5));
    }, 4000);

    return () => clearInterval(shuffleInterval);
  }, [searchResults.length, isChaosMode]);

  // Spec: Tapping an explore grid tile opens the post, but the grid behind it
  // silently re-renders and re-sorts, so closing returns the user to an unfamiliar view!
  const handleOpenPost = (post: Post) => {
    setInspectPost(post);
    if (isChaosMode) {
      // Silently re-shuffle grid in background!
      setGridPosts((prev) => [...prev].sort(() => Math.random() - 0.5));
    }
  };

  const handleCloseInspect = () => {
    setInspectPost(null);
  };

  // Filter posts based on query or category
  const displayedGrid = gridPosts.filter((post) => {
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      return (
        post.caption.toLowerCase().includes(q) ||
        post.author.username.toLowerCase().includes(q)
      );
    }
    if (selectedCategory === 'For You') return true;
    return (
      post.caption.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (post.location && post.location.toLowerCase().includes(selectedCategory.toLowerCase()))
    );
  });

  return (
    <div id="explore-screen" className="max-w-xl mx-auto pb-20 pt-2 select-none">
      {/* Search Bar with Forced 3s Debounce Spinner */}
      <div className="px-3 mb-2.5">
        <div className="relative flex items-center bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/90 rounded-xl px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin mr-2 flex-shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
          )}

          <input
            type="text"
            placeholder="Search (Forced 3s delay & shuffle)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />

          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setDebouncedQuery('');
                setSearchResults([]);
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isSearching && (
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
            <span>Aggregating results (3s artificial debounce)...</span>
          </div>
        )}
      </div>

      {/* Inverted "For You" Banner */}
      {isChaosMode && invertedActiveBanner && (
        <div className="mx-3 mb-2.5 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Inverted algorithm tuned to: <b>{invertedActiveBanner}</b></span>
        </div>
      )}

      {/* Search Results Shuffling List (Active when searched) */}
      {debouncedQuery && searchResults.length > 0 && (
        <div className="mx-3 mb-3 p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Accounts (Re-shuffles every 4s):
            </span>
            <span className="text-[10px] text-rose-500 animate-pulse">Shuffling active</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => onOpenUserProfile && onOpenUserProfile(user)}
                className="py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {user.username}
                    </div>
                    <div className="text-[11px] text-slate-400">{user.fullName}</div>
                  </div>
                </div>
                <button className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-semibold">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="px-3 mb-3 overflow-x-auto no-scrollbar flex items-center gap-1.5 py-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Media Mosaic Grid */}
      <div className="grid grid-cols-3 gap-1 px-1 sm:px-3">
        {displayedGrid.map((post, idx) => {
          const isLarge = idx % 7 === 0;
          const isCarousel = post.media.length > 1;

          return (
            <div
              key={post.id}
              onClick={() => handleOpenPost(post)}
              className={`relative aspect-square overflow-hidden bg-slate-900 rounded-sm cursor-pointer group ${
                isLarge ? 'col-span-2 row-span-2' : 'col-span-1'
              }`}
            >
              <img
                src={post.media[0].url}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {isCarousel && (
                <div className="absolute top-2 right-2 p-1 bg-black/60 rounded-md text-white backdrop-blur-xs">
                  <Copy className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-semibold text-xs backdrop-blur-[1px]">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likesCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{post.commentsCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Inspect Modal */}
      {inspectPost && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Explore Post
              </span>
              <button
                onClick={handleCloseInspect}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                ✕ Close (Grid will silently re-sort)
              </button>
            </div>

            <PostCard
              post={inspectPost}
              currentUser={currentUser}
              onToggleLike={onToggleLike}
              onToggleSave={onToggleSave}
              onAddComment={onAddComment}
              onOpenUserProfile={onOpenUserProfile}
              isChaosMode={isChaosMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};
