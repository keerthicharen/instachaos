import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType, generateDayOfWeekSeed } from './components/BottomNav';
import { Feed } from './components/Feed';
import { ExploreView } from './components/ExploreView';
import { ReelsView } from './components/ReelsView';
import { ShopView } from './components/ShopView';
import { ProfileView } from './components/ProfileView';
import { StoryViewer } from './components/StoryViewer';
import { StoryCreator } from './components/StoryCreator';
import { ReelCreator } from './components/ReelCreator';
import { LiveStreamView } from './components/LiveStreamView';
import { DirectMessages } from './components/DirectMessages';
import { NotificationsModal } from './components/NotificationsModal';
import { CreateModal } from './components/CreateModal';
import { ChaosOverlay } from './components/ChaosOverlay';
import { SettingsModal } from './components/SettingsModal';
import { DynamicIconChaos } from './components/DynamicIconChaos';
import { DmCaptchaModal } from './components/DmCaptchaModal';

import {
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_REELS,
  INITIAL_NOTES,
  INITIAL_CHATS,
  INITIAL_PRODUCTS,
  INITIAL_NOTIFICATIONS,
} from './mockData';
import { Post, UserStory, Reel, Note, ChatThread, Message, StoryItem, User } from './types';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('home');
  // Runs strictly and exclusively as InstaChaos
  const isChaosMode = true;

  // App Data State
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  // Random seed based on the current day of the week, refreshed on app refresh / new session
  const [bottomNavSeed] = useState<number>(() => generateDayOfWeekSeed());
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<UserStory[]>(INITIAL_STORIES);
  const [reels, setReels] = useState<Reel[]>(INITIAL_REELS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Modals & Overlays
  const [storyViewerIndex, setStoryViewerIndex] = useState<number | null>(null);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [isReelCreatorOpen, setIsReelCreatorOpen] = useState(false);
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false);
  const [liveStreamHost, setLiveStreamHost] = useState<User | undefined>(undefined);
  const [isDirectMessagesOpen, setIsDirectMessagesOpen] = useState(false);
  const [isDmCaptchaOpen, setIsDmCaptchaOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Spec: Keep CAPTCHA security challenge required for opening DMs
  const handleRequestOpenDMs = () => {
    setIsDmCaptchaOpen(true);
  };

  const handleDmCaptchaSuccess = () => {
    setIsDmCaptchaOpen(false);
    setIsDirectMessagesOpen(true);
  };

  // 1. Like & Save Handlers for Posts
  const handleToggleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  const handleToggleSavePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  const handleAddCommentPost = (postId: string, commentText: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `c_${Date.now()}`,
            user: {
              username: currentUser.username,
              avatar: currentUser.avatar,
            },
            text: commentText,
            timestamp: 'Just now',
            likes: 0,
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );
  };

  // 2. Like & Save Handlers for Reels
  const handleToggleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const isLiked = !r.isLiked;
          return {
            ...r,
            isLiked,
            likesCount: isLiked ? r.likesCount + 1 : r.likesCount - 1,
          };
        }
        return r;
      })
    );
  };

  const handleToggleSaveReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, isSaved: !r.isSaved } : r))
    );
  };

  const handleAddCommentReel = (reelId: string, commentText: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const newComment = {
            id: `rc_${Date.now()}`,
            user: {
              username: currentUser.username,
              avatar: currentUser.avatar,
            },
            text: commentText,
            timestamp: 'Just now',
            likes: 0,
          };
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [...r.comments, newComment],
          };
        }
        return r;
      })
    );
  };

  // 3. Story Creation & DM Reply
  const handlePublishStory = (newStoryItem: StoryItem) => {
    setStories((prev) => {
      const myStoryIndex = prev.findIndex((s) => s.user.id === currentUser.id);
      if (myStoryIndex >= 0) {
        const updated = [...prev];
        updated[myStoryIndex] = {
          ...updated[myStoryIndex],
          items: [newStoryItem, ...updated[myStoryIndex].items],
        };
        return updated;
      } else {
        return [
          {
            user: currentUser,
            hasUnseen: false,
            items: [newStoryItem],
          },
          ...prev,
        ];
      }
    });
  };

  const handleSendStoryReplyToDM = (targetUser: User, text: string) => {
    setChats((prev) => {
      const existingChat = prev.find((c) => c.participant.id === targetUser.id);
      const newMessage: Message = {
        id: `m_${Date.now()}`,
        senderId: currentUser.id,
        text,
        timestamp: 'Just now',
        status: 'delivered',
      };

      if (existingChat) {
        return prev.map((c) =>
          c.id === existingChat.id
            ? {
                ...c,
                lastMessage: newMessage,
                messages: [...c.messages, newMessage],
              }
            : c
        );
      } else {
        const newChat: ChatThread = {
          id: `chat_${targetUser.id}`,
          participant: targetUser,
          unreadCount: 0,
          lastMessage: newMessage,
          messages: [newMessage],
        };
        return [newChat, ...prev];
      }
    });
  };

  // 4. Post & Reel Publishing from Create Hub
  const handlePublishNewPost = (newPostData: Partial<Post>) => {
    const fullPost: Post = {
      id: `post_${Date.now()}`,
      author: currentUser,
      media: newPostData.media || [],
      caption: newPostData.caption || '',
      location: newPostData.location,
      timestamp: 'Just now',
      likesCount: 1,
      isLiked: true,
      isSaved: false,
      commentsCount: 0,
      comments: [],
      audioTrack: newPostData.audioTrack,
    };
    setPosts((prev) => [fullPost, ...prev]);
    setActiveTab('home');
  };

  const handlePublishNewReel = (newReel: Reel) => {
    setReels((prev) => [newReel, ...prev]);
    setActiveTab('reels');
  };

  // 5. Notes & Messaging
  const handleUpdateUserNote = (
    content: string,
    musicTrack?: { title: string; artist: string }
  ) => {
    setNotes((prev) => {
      const otherNotes = prev.filter((n) => n.user.id !== currentUser.id);
      const myNewNote: Note = {
        id: `note_my_${Date.now()}`,
        user: currentUser,
        content,
        musicTrack,
        timestamp: 'Just now',
      };
      return [myNewNote, ...otherNotes];
    });
  };

  const handleSendMessage = (chatId: string, messagePayload: Partial<Message>) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const fullMessage: Message = {
            id: `m_${Date.now()}`,
            senderId: messagePayload.senderId || currentUser.id,
            text: messagePayload.text,
            instant: messagePayload.instant,
            timestamp: 'Just now',
            status: 'delivered',
          };
          return {
            ...c,
            lastMessage: fullMessage,
            messages: [...c.messages, fullMessage],
          };
        }
        return c;
      })
    );
  };

  // 6. User Profile Updates
  const handleUpdateProfile = (updated: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...updated }));
  };

  // Unread badges
  const unreadNotifications = notifications.filter((n) => !n.isRead).length;
  const unreadDMs = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors font-body antialiased selection:bg-blue-500/20">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        unreadNotificationsCount={unreadNotifications}
        unreadDMsCount={unreadDMs}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenDMs={handleRequestOpenDMs}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGoHome={() => {
          setActiveTab('home');
          setIsDirectMessagesOpen(false);
        }}
        isChaosMode={isChaosMode}
      />

      {/* InstaChaos Satirical Overlay */}
      <ChaosOverlay
        isChaosMode={isChaosMode}
        onTriggerDirectMessages={handleRequestOpenDMs}
      />

      {/* Dynamic Cursor Proximity Icon Evasion */}
      <DynamicIconChaos />

      {/* Main Content Views */}
      <main className="min-h-[calc(100vh-112px)]">
        {isDirectMessagesOpen ? (
          <DirectMessages
            currentUser={currentUser}
            chats={chats}
            notes={notes}
            onBack={() => setIsDirectMessagesOpen(false)}
            onSendMessage={handleSendMessage}
            onUpdateUserNote={handleUpdateUserNote}
            isChaosMode={isChaosMode}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <Feed
                posts={posts}
                stories={stories}
                currentUser={currentUser}
                onOpenStory={(userIndex) => setStoryViewerIndex(userIndex)}
                onOpenStoryCreator={() => setIsStoryCreatorOpen(true)}
                onToggleLike={handleToggleLikePost}
                onToggleSave={handleToggleSavePost}
                onAddComment={handleAddCommentPost}
                onOpenUserProfile={() => setActiveTab('profile')}
                onOpenDMs={handleRequestOpenDMs}
                isChaosMode={isChaosMode}
              />
            )}

            {activeTab === 'explore' && (
              <ExploreView
                posts={posts}
                currentUser={currentUser}
                onToggleLike={handleToggleLikePost}
                onToggleSave={handleToggleSavePost}
                onAddComment={handleAddCommentPost}
                onOpenUserProfile={() => setActiveTab('profile')}
                isChaosMode={isChaosMode}
              />
            )}

            {activeTab === 'reels' && (
              <ReelsView
                reels={reels}
                currentUser={currentUser}
                onToggleLike={handleToggleLikeReel}
                onToggleSave={handleToggleSaveReel}
                onAddComment={handleAddCommentReel}
                onOpenCreateReel={() => setIsReelCreatorOpen(true)}
              />
            )}

            {activeTab === 'shop' && <ShopView products={INITIAL_PRODUCTS} />}

            {activeTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                posts={posts.filter((p) => p.author.id === currentUser.id || p.id === 'post_1')}
                reels={reels.filter((r) => r.author.id === currentUser.id || r.id === 'reel_1')}
                onUpdateProfile={handleUpdateProfile}
                onSelectPost={() => {}}
                onOpenSettings={() => setIsSettingsOpen(true)}
                isChaosMode={isChaosMode}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setIsDirectMessagesOpen(false);
        }}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        currentUser={currentUser}
        isChaosMode={isChaosMode}
        seed={bottomNavSeed}
        randomSeed={bottomNavSeed}
      />

      {/* Modals */}
      {/* 1. Fullscreen Story Viewer */}
      {storyViewerIndex !== null && (
        <StoryViewer
          stories={stories}
          initialUserIndex={storyViewerIndex}
          onClose={() => setStoryViewerIndex(null)}
          onSendReplyToDM={handleSendStoryReplyToDM}
          isChaosMode={isChaosMode}
        />
      )}

      {/* 2. Story Creator */}
      {isStoryCreatorOpen && (
        <StoryCreator
          onClose={() => setIsStoryCreatorOpen(false)}
          onPublishStory={handlePublishStory}
        />
      )}

      {/* 3. Reel Creator */}
      {isReelCreatorOpen && (
        <ReelCreator
          currentUser={currentUser}
          onClose={() => setIsReelCreatorOpen(false)}
          onPublishReel={handlePublishNewReel}
        />
      )}

      {/* 4. Live Stream (Host / Viewer) */}
      {isLiveStreamOpen && (
        <LiveStreamView
          currentUser={currentUser}
          hostUser={liveStreamHost}
          onClose={() => {
            setIsLiveStreamOpen(false);
            setLiveStreamHost(undefined);
          }}
        />
      )}

      {/* 5. Create Hub Modal (Post, Story, Reel, Live) */}
      {isCreateModalOpen && (
        <CreateModal
          currentUser={currentUser}
          onClose={() => setIsCreateModalOpen(false)}
          onPublishPost={handlePublishNewPost}
          onTriggerStoryCreator={() => setIsStoryCreatorOpen(true)}
          onTriggerReelCreator={() => setIsReelCreatorOpen(true)}
          onTriggerLive={() => {
            setLiveStreamHost(undefined);
            setIsLiveStreamOpen(true);
          }}
        />
      )}

      {/* 6. Notifications Modal */}
      {isNotificationsOpen && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onClearNotifications={() => setNotifications([])}
        />
      )}

      {/* 7. Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          currentUser={currentUser}
          userPosts={posts.filter((p) => p.author.id === currentUser.id)}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateProfile={handleUpdateProfile}
          onOpenDMs={handleRequestOpenDMs}
          isChaosMode={isChaosMode}
        />
      )}

      {/* 8. Required CAPTCHA for Opening Direct Messages */}
      <DmCaptchaModal
        isOpen={isDmCaptchaOpen}
        onClose={() => setIsDmCaptchaOpen(false)}
        onSuccess={handleDmCaptchaSuccess}
      />
    </div>
  );
}
