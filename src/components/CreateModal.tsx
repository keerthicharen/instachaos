import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Image,
  Sparkles,
  Clapperboard,
  Radio,
  Plus,
  MapPin,
  Music,
  ChevronLeft,
  ChevronRight,
  Crop,
  Check
} from 'lucide-react';
import { Post, PostMedia, User } from '../types';

interface CreateModalProps {
  currentUser: User;
  onClose: () => void;
  onPublishPost: (newPost: Partial<Post>) => void;
  onTriggerStoryCreator: () => void;
  onTriggerReelCreator: () => void;
  onTriggerLive: () => void;
  isChaosMode?: boolean;
}

const INITIAL_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80',
];

// Spec: Filter names don't match visual effect (e.g. Clarendon applies heavy blur, Original applies aggressive saturation)
const CHAOS_FILTERS = [
  { name: 'Original', style: 'saturate(3.2) contrast(1.4) brightness(1.1)', desc: 'Natural balanced daylight' },
  { name: 'Clarendon', style: 'blur(3.5px) contrast(1.1)', desc: 'High contrast vibrant shadows' },
  { name: 'Juno', style: 'grayscale(1) contrast(1.6)', desc: 'Warm magenta and golden tone' },
  { name: 'Valencia', style: 'invert(0.85) hue-rotate(180deg)', desc: 'Warm antique fade' },
  { name: 'Lark', style: 'hue-rotate(240deg) saturate(2)', desc: 'Bright outdoor coolness' },
  { name: 'Moon (B&W)', style: 'sepia(1) saturate(3) hue-rotate(-50deg)', desc: 'Classic black and white' },
  { name: 'Vintage', style: 'contrast(2) brightness(0.7) blur(1px)', desc: 'Soft 70s nostalgia' },
];

export const CreateModal: React.FC<CreateModalProps> = ({
  currentUser,
  onClose,
  onPublishPost,
  onTriggerStoryCreator,
  onTriggerReelCreator,
  onTriggerLive,
  isChaosMode = true,
}) => {
  // Step 1: Camera roll & Crop, Step 2: Filters, Step 3: Caption
  const [step, setStep] = useState<'pick' | 'caption'>('pick');
  const [cameraRoll, setCameraRoll] = useState<string[]>(() => {
    // Initial random shuffle
    return [...INITIAL_SAMPLE_IMAGES].sort(() => Math.random() - 0.5);
  });
  const [selectedImage, setSelectedImage] = useState<string>(cameraRoll[0]);

  // Crop handles inverted logic:
  // Dragging slider up/outward shrinks image (scale down), dragging inward enlarges it!
  const [cropHandlePos, setCropHandlePos] = useState(50); // 0 to 100
  const calculatedScale = isChaosMode
    ? 2.0 - (cropHandlePos / 100) * 1.5 // 50 gives 1.25, dragging right (100) shrinks to 0.5!
    : 0.5 + (cropHandlePos / 100) * 1.5;

  // Filters state
  const [activeFilter, setActiveFilter] = useState(CHAOS_FILTERS[0]);
  const [previousFilterName, setPreviousFilterName] = useState<string>('Normal');
  const [delayedTooltip, setDelayedTooltip] = useState<string | null>(null);

  // Caption and location
  const [caption, setCaption] = useState('Golden hour glow ☀️');
  const [location, setLocation] = useState('');
  const [audioName, setAudioName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const captionInputRef = useRef<HTMLTextAreaElement>(null);
  const cameraRollScrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Spec: Re-shuffles camera roll every time user scrolls back UP to re-check a photo!
  const handleCameraRollScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isChaosMode) return;
    const currentScrollTop = e.currentTarget.scrollTop;
    if (currentScrollTop < lastScrollTopRef.current - 15) {
      // User scrolled UP! Re-shuffle thumbnails!
      setCameraRoll((prev) => [...prev].sort(() => Math.random() - 0.5));
    }
    lastScrollTopRef.current = currentScrollTop;
  };

  // Spec: Hovering over filter shows tooltip that appears 2 seconds after filter has already changed,
  // so it's always describing the PREVIOUS filter!
  const handleSelectFilter = (filter: typeof CHAOS_FILTERS[0]) => {
    setPreviousFilterName(activeFilter.name);
    setActiveFilter(filter);

    setTimeout(() => {
      setDelayedTooltip(`Preview: ${previousFilterName} - ${filter.desc}`);
    }, 2000);
  };

  // Spec: Cursor doesn't follow clicks in text field — clicking inside caption box
  // places cursor at a random character index, forcing users to arrow-key to the right spot!
  const handleCaptionClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!isChaosMode) return;
    const input = captionInputRef.current;
    if (!input) return;
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * (input.value.length + 1));
      input.setSelectionRange(randomIndex, randomIndex);
    }, 10);
  };

  // Spec: Decoy "Post Now!" button saves post as draft and discards all edits with a small toast "Saved!"
  const handleDecoyDraftSave = () => {
    setToastMessage('Saved!');
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1200);
  };

  // Spec: The real Share button is a 2px-tall sliver hidden beneath a decorative divider line!
  const handleRealPublish = () => {
    const mediaItem: PostMedia = {
      id: `media_${Date.now()}`,
      url: selectedImage,
      type: 'image',
      filter: activeFilter.name,
    };

    onPublishPost({
      media: [mediaItem],
      caption: caption || 'Captured in the moment ✨',
      location: location || undefined,
      audioTrack: audioName ? { title: audioName, artist: currentUser.fullName } : undefined,
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const url = URL.createObjectURL(files[0] as File);
      setSelectedImage(url);
      setCameraRoll((prev) => [url, ...prev]);
    }
  };

  return (
    <div
      id="instachaos-create-modal"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col justify-between select-none">
        {/* Step 1: Camera Roll, Crop Handles, & Filters */}
        {step === 'pick' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header: Spec: 'Next' is placed where users expect 'Back' (top-left), while 'Back' is where 'Next' should be! */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {/* Spec: The 'Next' button to proceed to caption-writing is placed top-left (where Back normally is!) */}
              <button
                id="crop-next-btn-swapped"
                onClick={() => setStep('caption')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Next →
              </button>

              <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                New Post
              </h3>

              {/* Top-right close */}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {/* Image Preview with inverted crop handle */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-inner">
                <div
                  style={{
                    transform: `scale(${calculatedScale})`,
                    filter: activeFilter.style,
                  }}
                  className="w-full h-full transition-transform duration-100 flex items-center justify-center"
                >
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>

                {/* Crop Handle notice */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                  <Crop className="w-3 h-3" />
                  <span>Inverted Crop Scale</span>
                </div>
              </div>

              {/* Inverted Crop Slider */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5 font-medium">
                  <span>Crop Corner Handle:</span>
                  <span className="text-[11px] text-slate-400">
                    (Drag right to shrink, left to enlarge)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cropHandlePos}
                  onChange={(e) => setCropHandlePos(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Filters Carousel */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Filters (Names intentionally mismatched)
                </label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {CHAOS_FILTERS.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => handleSelectFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                        activeFilter.name === f.name
                          ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-200'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                {delayedTooltip && (
                  <div className="mt-1 text-[10px] text-amber-500 italic">
                    {delayedTooltip}
                  </div>
                )}
              </div>

              {/* Camera Roll Grid (Scroll up re-shuffles!) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Recents (Scroll up to re-shuffle):
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-600 hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Upload</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div
                  ref={cameraRollScrollRef}
                  onScroll={handleCameraRollScroll}
                  className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  {cameraRoll.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(url)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-transform ${
                        selectedImage === url ? 'border-blue-600 scale-95' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt="roll" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Bar: Spec: 'Back' is where 'Next' should be (bottom-right, primary-colored)! */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1120] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Step 1 of 2</span>
              <button
                onClick={onClose}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Caption, Cursor jump, and 2px Sliver Share vs Decoy Post Now */}
        {step === 'caption' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setStep('pick')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ← Back to Media
              </button>
              <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Write Caption
              </h3>
              <div className="w-10" />
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {/* Selected preview thumbnail */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    style={{ filter: activeFilter.style }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentUser.username}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Filter: {activeFilter.name}
                  </div>
                </div>
              </div>

              {/* Spec: Cursor doesn't follow clicks in text field — clicking places cursor at random character index */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Caption (Clicks jump cursor to random index):
                </label>
                <textarea
                  ref={captionInputRef}
                  rows={3}
                  value={caption}
                  onClick={handleCaptionClick}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share what's on your mind..."
                  className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 border border-slate-200/50 dark:border-slate-700/50"
                />
              </div>

              {/* Location & Music */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-200/50 dark:border-slate-700/50">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Add location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-200/50 dark:border-slate-700/50">
                  <Music className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Add music track"
                    value={audioName}
                    onChange={(e) => setAudioName(e.target.value)}
                    className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toast message if saved as draft */}
              {toastMessage && (
                <div className="p-2 bg-emerald-500 text-white text-xs font-semibold rounded-lg text-center animate-fade-in">
                  {toastMessage}
                </div>
              )}
            </div>

            {/* Spec: The final "Share" button is a 2px-tall sliver hidden beneath a decorative divider line,
                requiring a precise click; a large prominent decoy "Post Now!" button beside it saves post
                as a draft and discards all edits, with a small "success" toast reading "Saved!" */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1120] relative">
              {/* The Decorative Divider Line hiding the 2px-tall real Share sliver underneath! */}
              <div className="relative mb-3 group cursor-pointer" title="Divider (Or is it?)">
                <div className="w-full h-[1px] bg-slate-300 dark:bg-slate-700" />
                {/* 2px tall sliver right under the line */}
                <button
                  id="real-share-2px-sliver"
                  onClick={handleRealPublish}
                  title="Share"
                  style={{ height: '3px' }}
                  className="w-full block bg-transparent hover:bg-blue-600/30 active:bg-blue-600 transition-colors cursor-pointer"
                />
              </div>

              {/* Decoy prominent button */}
              <div className="flex items-center gap-3">
                <button
                  id="decoy-post-now-btn"
                  onClick={handleDecoyDraftSave}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                >
                  Post Now!
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center mt-2">
                Tip: The real Share button is the 2px hairline sliver right above "Post Now!"
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
