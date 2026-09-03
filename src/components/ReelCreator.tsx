import React, { useState, useRef } from 'react';
import { X, Video, Music, Sparkles, Send, Upload } from 'lucide-react';
import { Reel, User } from '../types';

interface ReelCreatorProps {
  currentUser: User;
  onClose: () => void;
  onPublishReel: (reel: Reel) => void;
}

const SAMPLE_REEL_VIDEOS = [
  {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    title: 'Ocean Coastline',
  },
  {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-of-a-lake-seen-up-close-18312-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    title: 'Rain Drops',
  },
  {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-cutting-fresh-vegetables-on-a-wooden-board-43098-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    title: 'Culinary Prep',
  },
];

export const ReelCreator: React.FC<ReelCreatorProps> = ({
  currentUser,
  onClose,
  onPublishReel,
}) => {
  const [selectedVideo, setSelectedVideo] = useState(SAMPLE_REEL_VIDEOS[0]);
  const [caption, setCaption] = useState('');
  const [audioTitle, setAudioTitle] = useState('Original Sound • ' + currentUser.username);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const newReel: Reel = {
      id: `reel_${Date.now()}`,
      author: currentUser,
      videoUrl: selectedVideo.videoUrl,
      posterUrl: selectedVideo.posterUrl,
      caption: caption || 'New reel moment 🎬✨ #viral #trending #reels',
      audioTrack: {
        title: audioTitle,
        artist: currentUser.fullName,
      },
      likesCount: 1,
      isLiked: true,
      commentsCount: 0,
      sharesCount: 0,
      comments: [],
      isSaved: false,
    };

    onPublishReel(newReel);
    onClose();
  };

  return (
    <div id="reel-creator-modal" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm bg-[#0f172a] text-white rounded-2xl p-5 shadow-2xl border border-slate-800 max-h-[90vh] flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-500" />
              <span>Create New Reel</span>
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-xs p-1 rounded-lg cursor-pointer">
              ✕
            </button>
          </div>

          <form onSubmit={handlePublish} className="pt-4 space-y-4">
            {/* Video Preview */}
            <div className="relative aspect-[9/16] max-h-72 mx-auto rounded-xl overflow-hidden bg-black shadow-lg border border-slate-800">
              <video
                src={selectedVideo.videoUrl}
                poster={selectedVideo.posterUrl}
                playsInline
                loop
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* Video selection presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Choose video clip or upload:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {SAMPLE_REEL_VIDEOS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVideo(item)}
                    className={`relative w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-transform cursor-pointer ${
                      selectedVideo.videoUrl === item.videoUrl
                        ? 'ring-2 ring-blue-600 scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Caption
              </label>
              <textarea
                rows={2}
                placeholder="Write a reel description... #explore #trending"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-slate-800/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 border border-slate-700/60"
              />
            </div>

            {/* Audio Track */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Audio Track
              </label>
              <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-700/60">
                <Music className="w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  className="w-full text-xs bg-transparent text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share Reel</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
