import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Edit3,
  Search,
  Camera,
  Image,
  Mic,
  Send,
  Plus,
  Music,
  Check,
  CheckCheck,
  Flame,
  Clock,
  Eye,
  X,
  Phone,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ChatThread, Message, Note, DisappearingInstant } from '../types';

interface DirectMessagesProps {
  currentUser: User;
  chats: ChatThread[];
  notes: Note[];
  onBack: () => void;
  onSendMessage: (chatId: string, message: Partial<Message>) => void;
  onUpdateUserNote: (content: string, musicTrack?: { title: string; artist: string }) => void;
  isChaosMode?: boolean;
}



export const DirectMessages: React.FC<DirectMessagesProps> = ({
  currentUser,
  chats,
  notes,
  onBack,
  onSendMessage,
  onUpdateUserNote,
  isChaosMode = true,
}) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteSong, setNoteSong] = useState('');
  const [selectedInstant, setSelectedInstant] = useState<DisappearingInstant | null>(null);
  const [instantCountdown, setInstantCountdown] = useState(5);
  const [showSendInstantModal, setShowSendInstantModal] = useState(false);
  const [instantViewMode, setInstantViewMode] = useState<'view_once' | 'allow_replay'>('view_once');

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [sendCoords, setSendCoords] = useState<{ x: number; y: number }>({ x: 260, y: 440 });

  const activeChat = chats.find((c) => c.id === activeChatId);
  const myNote = notes.find((n) => n.user.id === currentUser.id);

  // Randomize Send button coordinate (x, y) within the message container
  const randomizeSendCoords = () => {
    if (!messageContainerRef.current) return;
    const rect = messageContainerRef.current.getBoundingClientRect();
    const btnWidth = 84;
    const btnHeight = 36;
    const padding = 16;
    const topSafeOffset = 64; // Below header

    const availableWidth = Math.max(rect.width - btnWidth - padding * 2, 40);
    const availableHeight = Math.max(rect.height - btnHeight - topSafeOffset - padding, 80);

    const randX = Math.floor(Math.random() * availableWidth) + padding;
    const randY = Math.floor(Math.random() * availableHeight) + topSafeOffset;

    setSendCoords({ x: randX, y: randY });
  };

  const handleOpenInstant = (instant: DisappearingInstant) => {
    if (instant.isViewed && instant.viewMode === 'view_once') return;
    setSelectedInstant(instant);
    setInstantCountdown(5);

    const timer = setInterval(() => {
      setInstantCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSelectedInstant(null);
          instant.isViewed = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setKeystrokeCount((prev) => prev + 1);
    randomizeSendCoords();
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    onSendMessage(activeChatId, {
      senderId: currentUser.id,
      text: inputText.trim(),
      status: 'delivered',
    });
    setInputText('');
  };

  const handleSendInstantPhoto = (url: string) => {
    if (!activeChatId) return;
    const newInstant: DisappearingInstant = {
      id: `inst_${Date.now()}`,
      imageUrl: url,
      viewMode: instantViewMode,
      isViewed: false,
      senderId: currentUser.id,
      timestamp: 'Just now',
    };

    onSendMessage(activeChatId, {
      senderId: currentUser.id,
      instant: newInstant,
      status: 'delivered',
    });
    setShowSendInstantModal(false);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    onUpdateUserNote(
      noteContent.trim(),
      noteSong.trim() ? { title: noteSong.trim(), artist: 'Featured' } : undefined
    );
    setShowNoteModal(false);
    setNoteContent('');
    setNoteSong('');
  };

  // Spec: Conversation threads are sorted NOT by recency, but by the number of characters in the other person's display name — shortest names first!
  const filteredChats = chats.filter(
    (c) =>
      c.participant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedChats = [...filteredChats].sort((a, b) => {
    if (isChaosMode) {
      // Shortest full name / display name length first
      return a.participant.fullName.length - b.participant.fullName.length;
    }
    return 0;
  });

  return (
    <div
      id="direct-messages-container"
      className="max-w-xl mx-auto h-[calc(100vh-56px)] bg-white dark:bg-[#0b1120] flex flex-col border-x border-slate-200 dark:border-slate-800 select-none"
    >
      {/* Active Chat Room */}
      {activeChat ? (
        <div
          ref={messageContainerRef}
          className="relative flex flex-col h-full bg-slate-50 dark:bg-[#0b1120] overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveChatId(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-100" />
              </button>
              <div className="relative">
                <img
                  src={activeChat.participant.avatar}
                  alt={activeChat.participant.username}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0f172a]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span>{activeChat.participant.fullName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({activeChat.participant.fullName.length} chars)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">@{activeChat.participant.username}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeChat.messages.map((m) => {
              const isMine = m.senderId === currentUser.id;
              return (
                <div
                  key={m.id}
                  className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <img
                      src={activeChat.participant.avatar}
                      alt={activeChat.participant.username}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  )}

                  <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
                    {m.instant ? (
                      <div
                        onClick={() => handleOpenInstant(m.instant!)}
                        className={`p-3 rounded-xl flex items-center gap-2.5 shadow-xs cursor-pointer transition-all border ${
                          m.instant.isViewed && m.instant.viewMode === 'view_once'
                            ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 opacity-60'
                            : 'bg-gradient-to-r from-purple-600 to-rose-500 border-transparent text-white hover:opacity-95'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Flame className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">
                            {m.instant.isViewed && m.instant.viewMode === 'view_once'
                              ? 'Disappearing photo (Opened)'
                              : 'Disappearing photo'}
                          </div>
                          <div className="text-[10px] opacity-80">
                            {m.instant.isViewed ? 'Viewed' : 'Tap to view (5s)'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`px-3.5 py-2 rounded-xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    )}

                    <div
                      className={`text-[9px] text-slate-400 mt-1 flex items-center gap-1 ${
                        isMine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {isMine && (
                        <span>
                          {isChaosMode ? (
                            m.status === 'read' ? (
                              <Check className="w-3 h-3 text-slate-400" />
                            ) : (
                              <CheckCheck className="w-3 h-3 text-blue-500" />
                            )
                          ) : m.status === 'read' ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Check className="w-3 h-3 text-slate-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer Box */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] relative">
            {/* Spec: Opening a thread shows a 'seen' receipt on your own message before you've even sent it —
                as you type in composer, indicator above reads 'Seen just now' on an empty draft */}
            {isChaosMode && inputText.length > 0 && (
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-purple-600 dark:text-purple-400 animate-pulse">
                <Eye className="w-3.5 h-3.5" />
                <span>Seen just now (on your unsent draft)</span>
              </div>
            )}

            <div className="relative">
              <form onSubmit={handleSendText} className="flex items-center gap-2">
                <button
                  type="button"
                  id="dm-send-instant-btn"
                  onClick={() => setShowSendInstantModal(true)}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs cursor-pointer flex-shrink-0"
                  title="Send Disappearing Instant Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Message..."
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                      randomizeSendCoords();
                    }
                  }}
                  className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />

                {!inputText.trim() && (
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <button type="button" className="p-1.5 hover:text-slate-700 rounded-lg">
                      <Image className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1.5 hover:text-slate-700 rounded-lg">
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </form>
            </div>

            {inputText.trim() && (
              <div className="mt-2 flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                <span>Send button: (X: {sendCoords.x}px, Y: {sendCoords.y}px)</span>
                <span className="text-rose-500 font-medium animate-pulse">Randomizing on every character!</span>
              </div>
            )}
          </div>

          {/* Spec: 'Send' button changes its position to a random coordinate (x, y) within the message container after every single character typed in the message input field, making it nearly impossible to click */}
          {inputText.trim() && (
            <button
              type="button"
              onClick={handleSendText}
              onMouseEnter={randomizeSendCoords}
              onPointerEnter={randomizeSendCoords}
              id="dm-random-coord-send-btn"
              data-dodge-icon="true"
              style={{
                left: `${sendCoords.x}px`,
                top: `${sendCoords.y}px`,
              }}
              className="absolute z-50 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-2xl transition-all duration-75 cursor-pointer flex items-center gap-1.5 select-none ring-2 ring-white/60 dark:ring-blue-400/50"
              title={`Send (Coordinates: ${sendCoords.x}, ${sendCoords.y} - randomizing per character typed!)`}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 -rotate-12" />
            </button>
          )}
        </div>
      ) : (
        /* Conversations Inbox */
        <div className="flex flex-col h-full">
          {/* Top Bar */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-100" />
              </button>
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {currentUser.username}
                </h2>
                {isChaosMode && (
                  <span className="text-[10px] text-amber-500 font-medium">
                    Sorted by name character count (shortest first)
                  </span>
                )}
              </div>
            </div>
            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer border border-slate-200/50 dark:border-slate-700/50">
              <Edit3 className="w-4 h-4 text-slate-800 dark:text-slate-100" />
            </button>
          </div>

          {/* Notes Tray */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
            <div className="flex items-start gap-3.5">
              {/* My note */}
              <div
                onClick={() => setShowNoteModal(true)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              >
                <div className="relative mb-1">
                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-xl text-[10px] max-w-[84px] text-center shadow-xs truncate mb-1">
                    {myNote ? myNote.content : 'Share a thought...'}
                  </div>
                  <div className="w-14 h-14 rounded-full overflow-hidden mx-auto ring-1 ring-slate-300 dark:ring-slate-700">
                    <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute bottom-0 right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] ring-2 ring-white dark:ring-[#0b1120]">
                    +
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Your note</span>
              </div>

              {/* Friends' notes */}
              {notes
                .filter((n) => n.user.id !== currentUser.id)
                .map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      const chatWithUser = chats.find((c) => c.participant.id === n.user.id);
                      if (chatWithUser) setActiveChatId(chatWithUser.id);
                    }}
                    className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                  >
                    <div className="relative mb-1">
                      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-xl text-[10px] max-w-[90px] text-center shadow-xs truncate mb-1">
                        {n.content}
                      </div>
                      <div className="w-14 h-14 rounded-full overflow-hidden mx-auto ring-1 ring-slate-300 dark:ring-slate-700">
                        <img src={n.user.avatar} alt={n.user.username} className="w-full h-full object-cover" />
                      </div>
                      {n.musicTrack && (
                        <div className="absolute -bottom-1 -left-1 bg-slate-950/80 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 backdrop-blur-xs border border-white/10">
                          <Music className="w-2.5 h-2.5 text-rose-400" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-[70px]">
                      {n.user.username}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3">
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-200/50 dark:border-slate-700/50">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Sorted Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {sortedChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={chat.participant.avatar}
                      alt={chat.participant.username}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0b1120]" />
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{chat.participant.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({chat.participant.fullName.length} letters)
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      {chat.lastMessage.instant ? (
                        <span className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" /> Disappearing photo
                        </span>
                      ) : (
                        <span className="truncate max-w-[190px]">{chat.lastMessage.text}</span>
                      )}
                      <span>• {chat.lastMessage.timestamp}</span>
                    </div>
                  </div>
                </div>

                {chat.unreadCount > 0 && (
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disappearing Instant Viewer */}
      <AnimatePresence>
        {selectedInstant && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
            >
              <div className="p-4 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-400" />
                  <span className="text-xs font-bold">Disappearing Instant</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{instantCountdown}s</span>
                </div>
              </div>

              <img
                src={selectedInstant.imageUrl}
                alt="Instant"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="p-4 z-10 text-center text-white/80 text-xs bg-gradient-to-t from-black/80 to-transparent">
                This image will self-destruct once the timer ends.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send Instant Modal */}
      <AnimatePresence>
        {showSendInstantModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Send Instant Photo
                </h3>
                <button
                  onClick={() => setShowSendInstantModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-xs text-slate-500">
                  Select a photo to send as a disappearing message.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
                  ].map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Sample"
                      onClick={() => handleSendInstantPhoto(url)}
                      className="aspect-square rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent hover:border-purple-600"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Note Creator Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xs bg-white dark:bg-[#0f172a] rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3 text-center">
                Share a thought
              </h3>
              <form onSubmit={handleSaveNote} className="space-y-3">
                <input
                  type="text"
                  maxLength={60}
                  placeholder="What's on your mind? (60 chars)"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <input
                  type="text"
                  placeholder="Add a song (e.g. As It Was)"
                  value={noteSong}
                  onChange={(e) => setNoteSong(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-blue-700"
                  >
                    Share
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
