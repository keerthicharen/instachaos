export interface User {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  bio: string;
  isVerified?: boolean;
  website?: string;
  category?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface Comment {
  id: string;
  user: {
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface PostMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  aspectRatio?: string;
  filter?: string;
}

export interface Post {
  id: string;
  author: User;
  media: PostMedia[];
  caption: string;
  location?: string;
  timestamp: string;
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  commentsCount: number;
  comments: Comment[];
  audioTrack?: {
    title: string;
    artist: string;
  };
  taggedUsers?: string[];
}

export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: string;
  duration?: number; // seconds
  caption?: string;
}

export interface UserStory {
  user: User;
  hasUnseen: boolean;
  items: StoryItem[];
}

export interface Reel {
  id: string;
  author: User;
  videoUrl: string;
  posterUrl: string;
  caption: string;
  audioTrack: {
    title: string;
    artist: string;
  };
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  sharesCount: number;
  comments: Comment[];
  isSaved: boolean;
}

export interface Note {
  id: string;
  user: User;
  content: string;
  musicTrack?: {
    title: string;
    artist: string;
  };
  timestamp: string;
}

export interface DisappearingInstant {
  id: string;
  imageUrl: string;
  viewMode: 'view_once' | 'allow_replay';
  isViewed: boolean;
  senderId: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  instant?: DisappearingInstant;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatThread {
  id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
  isGroup?: boolean;
  groupName?: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  brandAvatar: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  description: string;
  category: 'Apparel' | 'Tech' | 'Home' | 'Beauty' | 'Accessories';
  inStock: boolean;
  tags: string[];
}

export interface LiveStream {
  id: string;
  host: User;
  title: string;
  viewersCount: number;
  isLive: boolean;
  startedAt: string;
}

export interface LiveComment {
  id: string;
  username: string;
  avatar: string;
  message: string;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: User;
  postThumbnail?: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}
