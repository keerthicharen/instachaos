import React, { useState, useRef } from 'react';
import { X, Image, Type, Sparkles, Send, Check } from 'lucide-react';
import { StoryItem } from '../types';

interface StoryCreatorProps {
  onClose: () => void;
  onPublishStory: (newStoryItem: StoryItem) => void;
}

const SAMPLE_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
];

export const StoryCreator: React.FC<StoryCreatorProps> = ({ onClose, onPublishStory }) => {
  const [selectedImage, setSelectedImage] = useState(SAMPLE_BACKGROUNDS[0]);
  const [captionText, setCaptionText] = useState('');
  const [filter, setFilter] = useState<'normal' | 'vintage' | 'noir' | 'vivid'>('normal');
  const [stickerType, setStickerType] = useState<string | null>('📍 Location');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const handlePublish = () => {
    const newStory: StoryItem = {
      id: `story_${Date.now()}`,
      mediaUrl: selectedImage,
      mediaType: 'image',
      timestamp: 'Just now',
      caption: captionText ? `${stickerType ? stickerType + ' • ' : ''}${captionText}` : stickerType || undefined,
    };
    onPublishStory(newStory);
    onClose();
  };

  const getFilterStyle = () => {
    switch (filter) {
      case 'vintage':
        return 'sepia(0.35) contrast(1.1) brightness(0.95)';
      case 'noir':
        return 'grayscale(1) contrast(1.2)';
      case 'vivid':
        return 'saturate(1.5) contrast(1.1)';
      default:
        return 'none';
    }
  };

  return (
    <div id="story-creator-modal" className="fixed inset-0 z-50 bg-black flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full h-full max-w-md bg-neutral-900 sm:rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl">
        {/* Top Control Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={onClose}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <button
              onClick={() => {
                const filters: ('normal' | 'vintage' | 'noir' | 'vivid')[] = ['normal', 'vintage', 'noir', 'vivid'];
                const nextIdx = (filters.indexOf(filter) + 1) % filters.length;
                setFilter(filters[nextIdx]);
              }}
              className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 cursor-pointer text-xs font-semibold flex items-center gap-1"
              title="Change filter"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="capitalize">{filter}</span>
            </button>

            {/* Sticker toggle */}
            <button
              onClick={() => {
                const stickers = ['📍 Tokyo, Japan', '🔥 Poll: Coffee or Tea?', '🎵 Cruel Summer - Taylor Swift', null];
                const nextIdx = (stickers.indexOf(stickerType) + 1) % stickers.length;
                setStickerType(stickers[nextIdx]);
              }}
              className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 cursor-pointer text-xs font-semibold"
            >
              Sticker
            </button>
          </div>
        </div>

        {/* Story Canvas */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={selectedImage}
            alt="Story background"
            style={{ filter: getFilterStyle() }}
            className="w-full h-full object-cover"
          />

          {/* Sticker Overlay */}
          {stickerType && (
            <div className="absolute top-28 bg-white/90 text-neutral-900 font-bold px-3.5 py-1.5 rounded-xl shadow-xl text-xs backdrop-blur-md border border-white/50 animate-bounce">
              {stickerType}
            </div>
          )}

          {/* Text input on the story */}
          <div className="absolute bottom-28 left-4 right-4">
            <input
              type="text"
              placeholder="Type a story caption..."
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              className="w-full bg-black/50 backdrop-blur-md text-white text-center text-sm font-semibold placeholder-white/60 py-3 px-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/80"
            />
          </div>
        </div>

        {/* Bottom controls: Preset photo selector & Share button */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-3">
          {/* Quick presets */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 rounded-lg border border-dashed border-white/40 flex flex-col items-center justify-center text-[10px] text-white/80 flex-shrink-0 hover:bg-white/10 cursor-pointer"
            >
              <Image className="w-4 h-4 mb-0.5" />
              <span>Upload</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {SAMPLE_BACKGROUNDS.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(url)}
                className={`w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 transition-transform ${
                  selectedImage === url ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt="preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Action Button: Share to your story */}
          <button
            id="publish-story-btn"
            onClick={handlePublish}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Share to Your Story (24h)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
