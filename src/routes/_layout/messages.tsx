import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { VoiceRecorder } from "../../components/VoiceRecorder";

export const Route = createFileRoute('/_layout/messages')({
  component: MessagesPage,
})

function MessagesPage() {
  const { data: conversations } = useSuspenseQuery(convexQuery(api.messages.getConversations, {}));
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  
  const messages = useQuery(api.messages.getMessages, selectedUserId ? { otherUserId: selectedUserId } : "skip" as any);
  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.messages.markRead);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedUserId) {
        markRead({ otherUserId: selectedUserId });
    }
  }, [selectedUserId, messages]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUserId) return;
    await sendMessage({ receiverId: selectedUserId, message: inputText.trim() });
    setInputText("");
  };

  const handleVoiceUpload = async (blob: Blob) => {
    if (!selectedUserId) return;
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": blob.type },
      body: blob,
    });
    const { storageId } = await result.json();
    await sendMessage({ receiverId: selectedUserId, audioStorageId: storageId });
  };

  const selectedConversation = conversations.find(c => c.otherUser._id === selectedUserId);

  return (
    <div className="h-[calc(100vh-160px)] flex bg-[#161d2f] rounded-[40px] border border-slate-800 overflow-hidden shadow-2xl">
      {/* Left Sidebar: Conversations */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-[#0a0f1e]/50">
        <div className="p-6 border-b border-slate-800 bg-slate-900/30">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Signals</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {conversations.map((c) => (
                <button 
                    key={c.otherUser._id}
                    onClick={() => setSelectedUserId(c.otherUser._id)}
                    className={`w-full p-6 text-left flex items-center space-x-4 transition hover:bg-blue-600/5 ${
                        selectedUserId === c.otherUser._id ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : ''
                    }`}
                >
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xs font-black overflow-hidden shrink-0 border border-slate-700">
                         {c.otherUser.image ? <img src={c.otherUser.image} className="w-full h-full object-cover" /> : c.otherUser.username?.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-black text-white truncate uppercase tracking-tight">{c.otherUser.username}</span>
                            {c.unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">{c.unreadCount}</span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate font-medium">
                            {c.lastMessage.audioUrl ? "🎤 Voice Transmission" : c.lastMessage.message}
                        </p>
                    </div>
                </button>
            ))}
            {conversations.length === 0 && (
                <div className="p-8 text-center text-slate-600 text-xs italic font-medium uppercase tracking-widest opacity-50">
                    Encryption Node Empty
                </div>
            )}
        </div>
      </div>

      {/* Right Area: Messages */}
      <div className="flex-1 flex flex-col bg-[#0a0f1e]/30">
        {selectedUserId ? (
            <>
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/30 backdrop-blur-md">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-[10px] font-black overflow-hidden border border-slate-700">
                             {selectedConversation?.otherUser.image ? <img src={selectedConversation.otherUser.image} className="w-full h-full object-cover" /> : selectedConversation?.otherUser.username?.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">{selectedConversation?.otherUser.username}</h3>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="text-[8px] text-green-500 font-black uppercase tracking-widest">Secure Link</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition">📞</button>
                        <button className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition">⚙️</button>
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-80">
                    {messages?.map((m) => (
                        <div key={m._id} className={`flex ${m.senderId === selectedUserId ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[70%] space-y-1`}>
                                <div className={`px-5 py-4 rounded-[24px] text-xs font-medium shadow-xl ${
                                    m.senderId === selectedUserId 
                                        ? 'bg-[#161d2f] border border-slate-800 text-slate-300 rounded-tl-none' 
                                        : 'bg-blue-600 text-white rounded-tr-none'
                                }`}>
                                    {m.audioUrl ? (
                                        <div className="flex items-center space-x-3 min-w-[150px]">
                                            <span className="text-lg">🔊</span>
                                            <audio src={m.audioUrl} controls className="h-8 max-w-[180px] brightness-125 saturate-150 contrast-125 filter invert" />
                                        </div>
                                    ) : (
                                        m.message
                                    )}
                                </div>
                                <div className={`text-[8px] font-black uppercase tracking-widest px-2 ${m.senderId === selectedUserId ? 'text-slate-600' : 'text-blue-500/50 text-right'}`}>
                                    {new Date(m._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {m.senderId !== selectedUserId && (
                                        <span className="ml-2">{m.isRead ? 'SYNCED' : 'SENT'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-900/50 border-t border-slate-800">
                    <form onSubmit={handleSendText} className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <input 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Push packet to secure node..."
                                className="w-full bg-[#0a0f1e] border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-600 pr-12 font-medium"
                            />
                            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-white transition font-black">➤</button>
                        </div>
                        <VoiceRecorder onRecordingComplete={handleVoiceUpload} />
                    </form>
                </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center flex-col space-y-6 opacity-30 grayscale">
                <div className="w-32 h-32 bg-slate-900 rounded-[48px] flex items-center justify-center text-5xl border border-slate-800">🔒</div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Zero Signals Detected</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">Select a communication node to begin decryption.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}
