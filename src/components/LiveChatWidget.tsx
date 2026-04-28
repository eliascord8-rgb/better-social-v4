import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";

export function LiveChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [guestId, setGuestId] = useState("");
    const [message, setMessage] = useState("");
    
    useEffect(() => {
        let id = localStorage.getItem("bs_guest_id");
        if (!id) {
            id = "guest_" + Math.random().toString(36).substring(7);
            localStorage.setItem("bs_guest_id", id);
        }
        setGuestId(id);
    }, []);

    const startSession = useMutation(api.liveChat.startSession);
    const markRead = useMutation(api.liveChat.markLiveChatRead);
    const [sessionId, setSessionId] = useState<any>(null);

    useEffect(() => {
        if (isOpen && guestId && !sessionId) {
            startSession({ guestId }).then(setSessionId);
        }
        if (isOpen && guestId) {
            markRead({ guestId });
        }
    }, [isOpen, guestId]);

    const messages = useQuery(api.liveChat.getMessages, sessionId ? { sessionId } : "skip" as any);
    const session = useQuery(api.liveChat.getSession, sessionId ? { sessionId } : "skip" as any);
    const unreadCount = useQuery(api.liveChat.getMyUnreadCount, { guestId }) || 0;
    const sendMessage = useMutation(api.liveChat.sendMessage);

    const user = useQuery(api.users.currentUser, {});
    const authSenderName = user?.username || "Guest";

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !sessionId) return;
        await sendMessage({
            sessionId,
            senderName: authSenderName,
            message: message.trim(),
            isAdmin: false,
        });
        setMessage("");
    };

    const scrollRef = useRef<HTMLDivElement>(null);
    const lastMessageCount = useRef(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
    }, []);

    useEffect(() => {
        if (messages && messages.length > lastMessageCount.current) {
            if (lastMessageCount.current > 0) {
                audioRef.current?.play().catch(() => {
                    // Browser might block autoplay until user interacts
                });
            }
            lastMessageCount.current = messages.length;
        }
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="fixed bottom-6 right-6 z-[200]">
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-blue-600 rounded-full shadow-[0_0_50px_rgba(37,99,235,0.4)] flex items-center justify-center text-2xl hover:scale-110 transition active:scale-95 cursor-pointer border-4 border-[#080c16] relative group"
                >
                    <span className="group-hover:rotate-12 transition-transform">💬</span>
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#080c16] animate-bounce shadow-lg">
                            {unreadCount}
                        </div>
                    )}
                </button>
            ) : (
                <div className="w-80 h-[500px] bg-[#111827] border border-blue-500/20 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xs font-black border border-white/10">BS</div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-tighter">Live Support</h4>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    <p className="text-[9px] text-blue-100 opacity-90 uppercase font-black tracking-widest">
                                        {session?.operatorName ? `Operator Joined: ${session.operatorName}` : "System Standby"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-lg text-white transition cursor-pointer">✕</button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0a0f1e]/80 scrollbar-hide">
                        <div className="bg-blue-600/5 border border-blue-500/10 p-4 rounded-2xl text-center">
                            <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em]">Secure Node Established</p>
                            <p className="text-[10px] text-slate-500 font-medium italic mt-1 leading-relaxed">"Transmission encrypted. Our staff is ready to assist your ascension."</p>
                        </div>

                        {messages?.map((m) => (
                            <div key={m._id} className={`flex flex-col ${m.isAdmin ? 'items-start' : 'items-end'}`}>
                                <div className="flex items-center space-x-2 mb-1.5 px-1">
                                    {m.isAdmin && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${m.isAdmin ? 'text-blue-400' : 'text-slate-500'}`}>
                                        {m.isAdmin ? (m.senderName === "System" ? "SYSTEM" : `STAFF: ${m.senderName}`) : m.senderName}
                                    </span>
                                </div>
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs font-medium shadow-xl relative group transition-all ${
                                    m.isAdmin 
                                        ? (m.senderName === "System" ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 italic rounded-tl-none' : 'bg-[#161d2f] text-slate-200 rounded-tl-none border border-slate-800 hover:border-slate-700') 
                                        : 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/20'
                                }`}>
                                    {m.message}
                                    <div className={`absolute bottom-0 text-[7px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${m.isAdmin ? 'left-full ml-2' : 'right-full mr-2'} text-slate-600`}>
                                        {new Date(m._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSend} className="p-5 bg-[#111827] border-t border-white/5 flex items-center space-x-3">
                        <input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your transmission..."
                            className="flex-1 bg-[#080c16] border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder-slate-600 font-medium shadow-inner"
                        />
                        <button type="submit" className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-500 transition shadow-lg shadow-blue-900/40 active:scale-90 cursor-pointer">
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
