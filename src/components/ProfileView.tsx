import React, { useState } from 'react';
import {
  Grid,
  Bookmark,
  UserCheck,
  Clapperboard,
  Settings,
  Edit2,
  Share2,
  Plus,
  Heart,
  MessageCircle,
  ExternalLink,
  Check,
  X,
  Camera,
  Crop
} from 'lucide-react';
import { User, Post, Reel } from '../types';
import { MOCK_USERS } from '../mockData';

interface ProfileViewProps {
  currentUser: User;
  posts: Post[];
  reels: Reel[];
  onUpdateProfile: (updated: Partial<User>) => void;
  onSelectPost: (post: Post) => void;
  onOpenSettings?: () => void;
  isChaosMode?: boolean;
}

interface Highlight {
  id: string;
  title: string;
  coverUrl: string;
}

const INITIAL_HIGHLIGHTS: Highlight[] = [
  {
    id: 'h1',
    title: 'Travel ✈️',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'h2',
    title: 'Studio 📸',
    coverUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'h3',
    title: 'Coffee ☕',
    coverUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'h4',
    title: 'Tokyo 🏮',
    coverUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=200&auto=format&fit=crop&q=80',
  },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  posts,
  reels,
  onUpdateProfile,
  onSelectPost,
  onOpenSettings,
  isChaosMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved' | 'tagged'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);

  // Edit fields state
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio);
  const [website, setWebsite] = useState(currentUser.website || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Auto-save on blur without feedback (Spec requirement!)
  const handleBlurAutoSave = () => {
    onUpdateProfile({
      fullName,
      username,
      bio,
      website,
      avatar,
    });
  };

  // Spec: Changing profile pic opens crop tool that forces circle crop, but preview is square,
  // and actual applied result is an oval stretched to 1.3x width!
  const [cropSquareUrl, setCropSquareUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  );

  const handleApplyStretchedAvatar = () => {
    // In chaos mode: apply stretched avatar
    setAvatar(cropSquareUrl);
    onUpdateProfile({ avatar: cropSquareUrl });
    setShowCropModal(false);
  };

  const handleCopyProfile = () => {
    setCopiedProfileLink(true);
    setTimeout(() => setCopiedProfileLink(false), 2000);
  };

  const savedPosts = posts.filter((p) => p.isSaved);

  return (
    <div id="profile-screen" className="max-w-xl mx-auto pb-20 pt-2 px-3 sm:px-4 select-none">
      {/* Top Bar / Username */}
      <div className="flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {currentUser.username}
          </h2>
          {currentUser.isVerified && (
            <span className="w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
          )}
        </div>
        <button
          onClick={() => (onOpenSettings ? onOpenSettings() : setShowEditModal(true))}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 transition-colors"
          title="Settings & Privacy"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header: Avatar & Stats */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Spec: Actual applied result is an oval stretched to 1.3x width in chaos mode */}
        <div
          onClick={() => setShowCropModal(true)}
          className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-0.5 ring-2 ring-blue-600/30 dark:ring-blue-400/30 bg-gradient-to-tr from-blue-600 via-indigo-500 to-rose-500 flex-shrink-0 cursor-pointer overflow-hidden ${
            isChaosMode ? 'scale-x-[1.3] rounded-[50%]' : ''
          }`}
          title="Change Profile Photo"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#0f172a] p-0.5">
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex-1 flex items-center justify-around text-center">
          <div>
            <div className="font-bold text-base text-slate-900 dark:text-white">
              {posts.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Posts</div>
          </div>

          <div
            onClick={() => setShowFollowersModal(true)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="font-bold text-base text-slate-900 dark:text-white">
              {currentUser.followersCount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Followers</div>
          </div>

          <div
            onClick={() => setShowFollowingModal(true)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="font-bold text-base text-slate-900 dark:text-white">
              {currentUser.followingCount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Following</div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="mb-4">
        <div className="font-bold text-sm text-slate-900 dark:text-white">
          {currentUser.fullName}
        </div>
        {currentUser.category && (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {currentUser.category}
          </div>
        )}
        <div className="text-xs text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-line leading-relaxed">
          {currentUser.bio}
        </div>
        {currentUser.website && (
          <a
            href={`https://${currentUser.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-1 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            <span>{currentUser.website}</span>
          </a>
        )}
      </div>

      {/* Action Buttons: Edit Profile & Share Profile */}
      <div className="flex items-center gap-2 mb-5">
        <button
          id="profile-edit-btn"
          onClick={() => setShowEditModal(true)}
          className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
        >
          Edit Profile
        </button>
        <button
          onClick={handleCopyProfile}
          className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center gap-1"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedProfileLink ? 'Link Copied!' : 'Share Profile'}</span>
        </button>
      </div>

      {/* Story Highlights */}
      <div className="mb-5 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-4">
          {INITIAL_HIGHLIGHTS.map((h) => (
            <div key={h.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
              <div className="w-16 h-16 rounded-full p-0.5 ring-1 ring-slate-300 dark:ring-slate-700 overflow-hidden">
                <img
                  src={h.coverUrl}
                  alt={h.title}
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-[68px]">
                {h.title}
              </span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
            <div className="w-16 h-16 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">New</span>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex border-t border-slate-200 dark:border-slate-800 text-slate-400">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 flex items-center justify-center transition-colors border-b-2 cursor-pointer ${
            activeTab === 'posts'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
              : 'border-transparent hover:text-slate-600'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('reels')}
          className={`flex-1 py-3 flex items-center justify-center transition-colors border-b-2 cursor-pointer ${
            activeTab === 'reels'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
              : 'border-transparent hover:text-slate-600'
          }`}
        >
          <Clapperboard className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 flex items-center justify-center transition-colors border-b-2 cursor-pointer ${
            activeTab === 'saved'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
              : 'border-transparent hover:text-slate-600'
          }`}
        >
          <Bookmark className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('tagged')}
          className={`flex-1 py-3 flex items-center justify-center transition-colors border-b-2 cursor-pointer ${
            activeTab === 'tagged'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
              : 'border-transparent hover:text-slate-600'
          }`}
        >
          <UserCheck className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1 mt-1">
        {activeTab === 'posts' &&
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="relative aspect-square bg-neutral-950 overflow-hidden cursor-pointer group"
            >
              <img
                src={post.media[0].url}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white font-bold text-xs">
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>{post.likesCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>{post.commentsCount}</span>
                </div>
              </div>
            </div>
          ))}

        {activeTab === 'reels' &&
          reels.map((reel) => (
            <div
              key={reel.id}
              className="relative aspect-[9/16] bg-neutral-950 overflow-hidden cursor-pointer group"
            >
              <img
                src={reel.posterUrl}
                alt={reel.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[11px] font-bold drop-shadow">
                <Clapperboard className="w-3.5 h-3.5" />
                <span>{reel.likesCount}</span>
              </div>
            </div>
          ))}

        {activeTab === 'saved' &&
          (savedPosts.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-neutral-400 text-xs">
              No saved posts yet.
            </div>
          ) : (
            savedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="relative aspect-square bg-neutral-950 overflow-hidden cursor-pointer group"
              >
                <img
                  src={post.media[0].url}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ))
          ))}

        {activeTab === 'tagged' && (
          <div className="col-span-3 text-center py-12 text-neutral-400 text-xs">
            Photos and videos of you will appear here.
          </div>
        )}
      </div>

      {/* Edit Profile Modal (Spec: NO 'Save' or 'Done' button! Auto-saves on blur with NO feedback) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Edit Profile
              </h3>
              <button
                onClick={() => {
                  handleBlurAutoSave();
                  setShowEditModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1 cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="pt-4 space-y-3">
              {/* Profile Photo button */}
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={avatar}
                  alt="Current avatar"
                  className={`w-12 h-12 rounded-full object-cover ${
                    isChaosMode ? 'scale-x-[1.3]' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCropModal(true)}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Change Profile Photo
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={handleBlurAutoSave}
                  className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 border border-slate-200/50 dark:border-slate-700/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={handleBlurAutoSave}
                  className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 border border-slate-200/50 dark:border-slate-700/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onBlur={handleBlurAutoSave}
                  className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 border border-slate-200/50 dark:border-slate-700/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  onBlur={handleBlurAutoSave}
                  className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 border border-slate-200/50 dark:border-slate-700/50"
                />
              </div>

              {/* Spec: NO "Save" or "Done" button exists! Only leaving the modal by closing it */}
              <div className="pt-2 text-[10px] text-slate-400 text-center italic">
                (Changes auto-save on blur; there is intentionally no Save button)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Crop Tool Modal:
          Spec: Forces circle crop, but preview is square, and actual applied result is oval stretched to 1.3x width! */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Crop className="w-4 h-4 text-blue-600" />
                <span>Circle Crop Tool</span>
              </h3>
              <button
                onClick={() => setShowCropModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-500">
                Adjust the crop boundary for your new avatar.
              </p>

              {/* Spec: Preview is a SQUARE! */}
              <div className="relative w-48 h-48 mx-auto rounded-none border-2 border-dashed border-blue-600 overflow-hidden bg-black shadow-inner flex items-center justify-center">
                <img
                  src={cropSquareUrl}
                  alt="Crop preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border border-white/40 pointer-events-none" />
                <span className="absolute bottom-1 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded">
                  Preview: Square
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
                  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
                ].map((u, i) => (
                  <img
                    key={i}
                    src={u}
                    alt="Choice"
                    onClick={() => setCropSquareUrl(u)}
                    className={`w-10 h-10 rounded-md object-cover cursor-pointer border-2 ${
                      cropSquareUrl.startsWith(u) ? 'border-blue-600' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleApplyStretchedAvatar}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Apply Circle Crop (Applies 1.3x oval)
            </button>
          </div>
        </div>
      )}

      {/* Followers / Following Modal */}
      {(showFollowersModal || showFollowingModal) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[70vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {showFollowersModal ? 'Followers' : 'Following'}
                </h3>
                <button
                  onClick={() => {
                    setShowFollowersModal(false);
                    setShowFollowingModal(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="py-3 space-y-3 overflow-y-auto max-h-72">
                {Object.values(MOCK_USERS).map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <span>{user.username}</span>
                          {user.isVerified && (
                            <span className="w-3 h-3 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{user.fullName}</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-semibold cursor-pointer border border-slate-200/50 dark:border-slate-700/50">
                      Following
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
