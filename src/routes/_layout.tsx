import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuthActions } from "@convex-dev/auth/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { useI18n, translations } from "../lib/i18n";
import type { Language } from "../lib/i18n";
import type { Id } from "../../convex/_generated/dataModel";
import { UserProfileModal } from "../components/UserProfileModal";

export const Route = createFileRoute('/_layout')({
  component: DashboardLayout,
})

function LanguageSwitcher({ current, onSelect, minimal = false }: { current: Language, onSelect: (l: Language) => void, minimal?: boolean }) {
    if (minimal) {
        return (
            <div className="flex items-center space-x-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                {(Object.keys(translations) as Language[]).map((l) => (
                    <button 
                        key={l}
                        onClick={() => onSelect(l)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${current === l ? 'bg-blue-600 shadow-lg shadow-blue-900/40 opacity-100 scale-105' : 'opacity-30 hover:opacity-100 hover:bg-white/5'}`}
                    >
                        {translations[l].flag}
                    </button>
                ))}
            </div>
        )
    }
    return (
        <div className="flex items-center space-x-3 mb-8">
            {(Object.keys(translations) as Language[]).map((l) => (
                <button 
                    key={l}
                    onClick={() => onSelect(l)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl border transition-all ${current === l ? 'border-blue-500 bg-blue-500/10 scale-110 shadow-lg shadow-blue-500/20' : 'border-white/5 hover:border-white/20 opacity-50 hover:opacity-100'}`}
                >
                    {translations[l].flag}
                </button>
            ))}
        </div>
    );
}

function SidebarLink({ to, icon, children, badge }: { to: string, icon: string, children: React.ReactNode, badge?: number }) {
    const [loading, setLoading] = useState(false);

    return (
        <Link 
            to={to as any} 
            onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 2000);
            }}
            className="flex items-center px-4 py-3.5 text-slate-400 rounded-2xl hover:bg-blue-600/10 hover:text-blue-400 transition-all duration-300 [&.active]:bg-gradient-to-r [&.active]:from-blue-600 [&.active]:to-blue-500 [&.active]:text-white shadow-lg shadow-blue-900/10 mb-2 border border-transparent [&.active]:border-blue-400/30 group relative overflow-hidden"
        >
            {loading && (
                <div className="absolute inset-0 bg-blue-400 z-50 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            )}
            <span className="mr-4 text-xl drop-shadow-md group-hover:scale-110 transition-transform">{icon}</span> 
            <span className="text-[11px] font-black uppercase tracking-wider flex-1 italic">{children}</span>
            {badge && badge > 0 ? (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    {badge}
                </span>
            ) : null}
        </Link>
    )
}

function OnlineCounter() {
    const [count, setCount] = useState(1240);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => {
                const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
                return Math.max(1210, Math.min(1300, prev + change));
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-center space-x-2 opacity-50 hover:opacity-100 transition-opacity">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
                {count.toLocaleString()} ACTIVE NODES IN NETWORK
            </span>
        </div>
    );
}

function PresenceBadge({ userId }: { userId: Id<"users"> }) {
    const presence = useQuery(api.users.getPresence, { userId });
    if (!presence) return null;

    if (presence.isOnline) {
        return (
            <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Online Now</span>
            </div>
        );
    }

    if (!presence.lastSeen) return null;

    const diff = Date.now() - presence.lastSeen;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    let text = "";
    if (days > 0) text = `${days}d ago`;
    else if (hours > 0) text = `${hours}h ago`;
    else if (mins > 0) text = `${mins}m ago`;
    else text = "just now";

    return (
        <div className="flex items-center space-x-1.5 opacity-50">
            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic truncate max-w-[60px]">Seen {text}</span>
        </div>
    );
}

function CommunityChat({ 
    mobileClose, 
    onUserClick,
    externalTab,
    onTabChange,
    externalPrivateUser,
    onPrivateUserChange
}: { 
    mobileClose?: () => void, 
    onUserClick: (id: Id<"users">) => void,
    externalTab?: "global" | "private",
    onTabChange?: (tab: "global" | "private") => void,
    externalPrivateUser?: Id<"users"> | null,
    onPrivateUserChange?: (id: Id<"users"> | null) => void
}) {
    const [internalTab, setInternalTab] = useState<"global" | "private">("global");
    const [internalPrivateUser, setInternalPrivateUser] = useState<Id<"users"> | null>(null);

    const activeTab = externalTab ?? internalTab;
    const setActiveTab = onTabChange ?? setInternalTab;
    const selectedPrivateUser = externalPrivateUser ?? internalPrivateUser;
    const setSelectedPrivateUser = onPrivateUserChange ?? setInternalPrivateUser;
    const user = useQuery(api.users.currentUser, {});
    const conversations = useQuery(api.chat.getConversations, {}) || [];
    const globalMessages = useQuery(api.chat.getMessages, {}) || [];
    const privateMessages = useQuery(api.chat.getDirectMessages, selectedPrivateUser ? { otherUserId: selectedPrivateUser } : "skip" as any) || [];
    
    const sendGlobal = useMutation(api.chat.sendMessage);
    const sendPrivate = useMutation(api.chat.sendDirectMessage);
    const markRead = useMutation(api.chat.markDirectMessagesRead);
    
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const isMuted = user?.muteUntil && user.muteUntil > Date.now();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [globalMessages, privateMessages, activeTab, selectedPrivateUser]);

    useEffect(() => {
        if (selectedPrivateUser) {
            markRead({ otherUserId: selectedPrivateUser });
        }
    }, [selectedPrivateUser, (privateMessages as any).length, markRead]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isMuted) return;
        
        if (activeTab === "global") {
            await sendGlobal({ message: input.trim() });
        } else if (selectedPrivateUser) {
            await sendPrivate({ receiverId: selectedPrivateUser, message: input.trim() });
        }
        setInput("");
    };

    const currentMessages = activeTab === "global" ? globalMessages : privateMessages;
    const privateTargetUser = conversations.find((c: any) => c.userId === selectedPrivateUser);

    return (
        <div className="w-80 h-full flex flex-col bg-[#0f172a] border-l border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            <div className="p-4 bg-gradient-to-r from-slate-900 to-[#0f172a] border-b border-slate-800 shadow-lg">
                {activeTab === "private" && selectedPrivateUser ? (
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setSelectedPrivateUser(null)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-xl text-white hover:bg-slate-700 transition active:scale-90">←</button>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic truncate">{(privateTargetUser as any)?.username || "Secure Node"}</h4>
                            <PresenceBadge userId={selectedPrivateUser} />
                        </div>
                        {mobileClose && (
                            <button onClick={mobileClose} className="lg:hidden w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white text-xs">✕</button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs shadow-lg shadow-blue-600/20">📡</div>
                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic">Hub Terminal</h4>
                            </div>
                            {mobileClose && (
                                <button onClick={mobileClose} className="lg:hidden w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white text-xs">✕</button>
                            )}
                        </div>
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setActiveTab("global")}
                                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === "global" ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Global
                            </button>
                            <button 
                                onClick={() => setActiveTab("private")}
                                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all relative ${activeTab === "private" ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Messages
                                {conversations.some((c: any) => c.unreadCount > 0) && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950"></span>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-95">
                {activeTab === "private" && !selectedPrivateUser ? (
                    <div className="p-2 space-y-1">
                        {conversations.length === 0 ? (
                            <div className="p-12 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic leading-loose">
                                No secure channels established.<br/>Tap a node profile to begin.
                            </div>
                        ) : (
                            conversations.map((c: any) => (
                                <button 
                                    key={c.userId}
                                    onClick={() => setSelectedPrivateUser(c.userId)}
                                    className="w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-white/[0.03] transition-all group border border-transparent hover:border-white/5"
                                >
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 overflow-hidden">
                                            {c.image ? <img src={c.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
                                        </div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black text-white uppercase tracking-tight truncate">{c.username}</span>
                                            <span className="text-[7px] text-slate-500 font-bold">{new Date(c.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{c.lastMessage}</div>
                                        <PresenceBadge userId={c.userId} />
                                    </div>
                                    {c.unreadCount > 0 && (
                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg shadow-blue-900/40 animate-pulse">
                                            {c.unreadCount}
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="p-5 space-y-5">
                        {currentMessages.length === 0 ? (
                            <div className="p-12 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">Channel Empty.</div>
                        ) : (
                            currentMessages.map((m: any) => (
                                <div key={m._id} className={`group animate-in fade-in slide-in-from-bottom-2 ${activeTab === 'private' && m.senderId === user?._id ? 'flex flex-col items-end' : ''}`}>
                                    <div className={`flex items-center space-x-2 mb-1.5 ${activeTab === 'private' && m.senderId === user?._id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        {activeTab === 'global' && (
                                            <>
                                                <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black ${m.level > 50 ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                                                    {m.level}
                                                </div>
                                                <span className={`px-1 py-0.5 rounded-[4px] font-black text-[6px] uppercase tracking-tighter ${
                                                    m.role === 'admin' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-slate-800 text-zinc-500'
                                                }`}>
                                                    {m.role}
                                                </span>
                                            </>
                                        )}
                                        <span className="text-slate-600 font-black text-[7px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            {new Date(m._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`flex items-start space-x-3 ${activeTab === 'private' && m.senderId === user?._id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        <div className={`flex-1 min-w-0 ${activeTab === 'private' && m.senderId === user?._id ? 'text-right' : ''}`}>
                                            {activeTab === 'global' && (
                                                <span 
                                                    onClick={() => onUserClick(m.userId)}
                                                    className="font-black text-slate-100 text-[11px] hover:text-blue-500 transition cursor-pointer flex items-center space-x-2"
                                                >
                                                    <span>{m.username}</span>
                                                </span>
                                            )}
                                            <div className={`mt-1 text-[11px] leading-relaxed break-words font-medium px-3 py-2 rounded-2xl border shadow-lg transition-all group-hover:translate-x-1 ${
                                                activeTab === 'private' && m.senderId === user?._id
                                                    ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                                                    : m.role === 'system'
                                                        ? 'bg-blue-600/5 text-blue-400 border-blue-500/20 italic rounded-tl-none'
                                                        : 'bg-slate-800/40 text-slate-300 border-white/5 rounded-tl-none'
                                            }`}>
                                                {m.message}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {(activeTab === "global" || (activeTab === "private" && selectedPrivateUser)) && (
                <div className="p-5 bg-slate-900 border-t border-slate-800 relative z-10">
                    {isMuted && user?.muteUntil && activeTab === "global" && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] text-red-500 font-black uppercase tracking-widest leading-relaxed italic text-center animate-pulse">
                            IDENTITY NODE MUTED UNTIL {new Date(user.muteUntil as any).toLocaleString()}
                        </div>
                    )}
                    <form onSubmit={handleSend} className="relative mb-4">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={!!(isMuted && activeTab === "global")}
                            placeholder={isMuted && activeTab === "global" ? "ACCESS DENIED" : "Inject transmission..."}
                            className="w-full bg-[#0a0f1e] border border-slate-700 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-600 pr-12 placeholder-slate-600 font-medium shadow-inner transition-all hover:border-slate-600"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-500 transition active:scale-90 shadow-lg shadow-blue-900/40 cursor-pointer">
                            ➤
                        </button>
                    </form>
                    <OnlineCounter />
                </div>
            )}
        </div>
    )
}

function GlobalAlerts() {
    const notificationsResult = useQuery(api.chat.getNotifications, {});
    const notifications = notificationsResult || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notifications.length > 0) {
            const cycle = () => {
                setVisible(true);
                setTimeout(() => {
                    setVisible(false);
                    setTimeout(() => {
                        setCurrentIndex((prev) => (prev + 1) % notifications.length);
                    }, 700);
                }, 3000); // Show for 3 seconds
            };

            cycle();
            const interval = setInterval(cycle, 20000); // Every 20 seconds
            return () => clearInterval(interval);
        }
    }, [notifications.length]);

    if (notifications.length === 0) return null;

    const current = notifications[currentIndex];

    return (
        <div className={`fixed inset-0 z-[1000] pointer-events-none flex items-center justify-center transition-all duration-700 transform ${visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="bg-[#111827]/95 border-2 border-blue-600/50 backdrop-blur-2xl px-12 py-8 rounded-[40px] shadow-[0_0_150px_rgba(37,99,235,0.3)] flex flex-col items-center text-center max-w-lg mx-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-2xl shadow-blue-600/20 rotate-3">
                   {current.type === 'order' ? '🛒' : '⚡'}
                </div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-4">Network Transmission</span>
                <span className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-lg">{current.content}</span>
            </div>
        </div>
    )
}

function AdminSweetAlert({ ticket, onClose }: { ticket: any, onClose: () => void }) {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#161d2f] border-2 border-yellow-500/50 rounded-[40px] p-10 max-w-sm w-full text-center shadow-[0_0_100px_rgba(234,179,8,0.2)] animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 border border-yellow-500/30 animate-pulse ring-8 ring-yellow-500/5">
                    🎫
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">Transmission Inbound</h2>
                <p className="text-slate-400 text-sm mb-8">
                    A Better Social client has opened a support ticket:<br/>
                    <span className="text-yellow-500 font-bold uppercase mt-2 block">"{ticket.subject}"</span>
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={() => {
                            navigate({ to: '/admin' });
                            onClose();
                        }}
                        className="w-full py-4 bg-yellow-500 text-black font-black rounded-2xl hover:bg-yellow-400 transition uppercase text-xs tracking-widest cursor-pointer"
                    >
                        Intercept Signal
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-slate-800 text-slate-400 font-black rounded-2xl hover:text-white transition uppercase text-[10px] tracking-widest cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    )
}

function DashboardLayout() {
  const { t, lang, setLang } = useI18n();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const user = useQuery(api.users.currentUser, {});

  useEffect(() => {
    if (user === null) {
      navigate({ to: '/' });
    }
  }, [user, navigate]);

  const claimRakeback = useMutation(api.users.claimRakeback);
  const tickets = useQuery(api.tickets.getMyTickets, {}) || [];
  const unreadTickets = tickets.filter(t => t.hasUnreadAdminReply).length;
  const guestId = localStorage.getItem("bs_guest_id") || "GUEST";
  const unreadLiveChat = useQuery(api.liveChat.getMyUnreadCount, { guestId }) || 0;
  const notifications = useQuery(api.notifications.getMyNotifications, {}) || [];
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  const markNotificationsRead = useMutation(api.notifications.markAllRead);
  const heartbeat = useMutation(api.users.heartbeat);

  useEffect(() => {
    const interval = setInterval(() => {
        if (user) heartbeat({});
    }, 30000); // Heartbeat every 30s
    return () => clearInterval(interval);
  }, [user, heartbeat]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState<"global" | "private">("global");
  const [chatPrivateUser, setChatPrivateUser] = useState<Id<"users"> | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);

  const handleMessageRequest = (targetId: Id<"users">) => {
    setChatTab("private");
    setChatPrivateUser(targetId);
    setChatOpen(true);
    setSelectedUserId(null);
  };

  const allTickets = useQuery(api.tickets.getAllTicketsAdmin, {}) || [];
  const [lastTicketCount, setLastTicketCount] = useState(0);
  const [newTicketForAlert, setNewTicketForAlert] = useState<any>(null);

  useEffect(() => {
    if ((user?.isAdmin || user?.isMod) && allTickets.length > lastTicketCount) {
        if (lastTicketCount > 0) {
            setNewTicketForAlert(allTickets[0]);
        }
        setLastTicketCount(allTickets.length);
    }
  }, [allTickets, lastTicketCount, user?.isAdmin, user?.isMod]);

  useEffect(() => {
    const timer = setInterval(() => {
        if (user?.lastRakebackTime) {
            const next = user.lastRakebackTime + (24 * 60 * 60 * 1000);
            const diff = next - Date.now();
            if (diff <= 0) {
                setTimeLeft("CLAIM");
                return;
            }
            const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
            const secs = Math.floor((diff % (60 * 1000)) / 1000);
            setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [user?.lastRakebackTime]);

  if (user === undefined) {
    return (
        <div className="flex h-screen bg-[#030712] items-center justify-center">
            <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-[100dvh] bg-[#030712] text-zinc-100 overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      <GlobalAlerts />
      {newTicketForAlert && <AdminSweetAlert ticket={newTicketForAlert} onClose={() => setNewTicketForAlert(null)} />}
      {selectedUserId && (
        <UserProfileModal 
            userId={selectedUserId} 
            onClose={() => setSelectedUserId(null)} 
            onMessageRequest={handleMessageRequest}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#09090b] border-r border-white/5 h-full relative z-50">
        <div className="p-8 h-20 flex items-center border-b border-white/5">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-[10px] font-black text-white group-hover:rotate-12 transition-all shadow-lg shadow-blue-600/30">BS</div>
                <span className="text-lg font-black text-white tracking-tighter uppercase italic">Better<span className="text-blue-500">Social</span></span>
            </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
            <div>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4 px-4 opacity-50">Operations</h3>
                <div className="space-y-1">
                    <SidebarLink to="/dashboard" icon="🏠">{t('dashboard')}</SidebarLink>
                    <SidebarLink to="/new-order" icon="🛍️">{t('new_order')}</SidebarLink>
                    <SidebarLink to="/orders" icon="📜">{t('order_log')}</SidebarLink>
                </div>
            </div>

            <div>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4 px-4 opacity-50">Network</h3>
                <div className="space-y-1">
                    <SidebarLink to="/add-funds" icon="💳">{t('refuel_balance')}</SidebarLink>
                    <SidebarLink to="/tickets" icon="📩" badge={unreadTickets + unreadLiveChat}>{t('support_hub')}</SidebarLink>
                    <SidebarLink to="/irc" icon="👾">{t('irc_terminal')}</SidebarLink>
                    <SidebarLink to="/kyc" icon="🛡️">Verification</SidebarLink>
                </div>
            </div>

            {(user?.isAdmin || user?.isMod) && (
                <div>
                    <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] mb-4 px-4 opacity-50">Administration</h3>
                    <div className="space-y-1">
                        <SidebarLink to="/admin" icon="⚙️">Control Center</SidebarLink>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-white/5 space-y-4">
            <Link to="/settings" className="flex items-center space-x-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 group-hover:scale-105 transition-transform">
                    {user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-white truncate">{user?.username}</div>
                    <div className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Lv. {user?.level || 1} Elite</div>
                </div>
            </Link>
            <button 
                onClick={() => {
                    sessionStorage.removeItem("bs_session_id");
                    void signOut();
                }}
                className="w-full py-3 bg-zinc-900 text-[10px] font-bold text-zinc-500 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-xl flex items-center justify-center space-x-2 border border-white/5 group active:scale-95 cursor-pointer"
            >
                <span className="opacity-50">🔒</span>
                <span className="uppercase tracking-widest">Logout Session</span>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full min-w-0">
        <header className="h-20 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
            <div className="flex items-center space-x-4">
                <div className="lg:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[8px] font-black text-white shadow-lg shadow-blue-600/30">BS</div>
                <div className="text-xs font-bold text-zinc-500 hidden sm:block uppercase tracking-widest">System Status: <span className="text-emerald-500">Nominal</span></div>
            </div>

            <div className="flex items-center space-x-3">
                <button
                    onClick={() => {
                        setShowNotifications(!showNotifications);
                        if (!showNotifications) markNotificationsRead({});
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all active:scale-90 relative ${showNotifications ? 'bg-blue-600 text-white' : 'bg-zinc-900 border border-white/5 text-zinc-400'}`}
                >
                    🔔
                    {unreadNotifications > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[8px] font-black text-white rounded-full flex items-center justify-center border-2 border-[#09090b]">{unreadNotifications}</span>}
                </button>

                <div className="hidden sm:flex items-center bg-zinc-900/80 border border-white/5 rounded-xl px-4 py-2 space-x-4">
                    <div className="text-right">
                        <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Balance</div>
                        <div className="text-xs font-black text-white tabular-nums">${(user?.balance || 0).toFixed(2)}</div>
                    </div>
                    <Link to="/add-funds" className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg font-bold hover:bg-blue-500 transition active:scale-90">+</Link>
                </div>

                <button onClick={() => setChatOpen(!chatOpen)} className="lg:hidden w-10 h-10 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-center text-lg text-zinc-400 active:scale-90 relative">
                    💬
                    {unreadLiveChat > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[8px] font-black text-white rounded-full flex items-center justify-center border-2 border-[#09090b]">{unreadLiveChat}</span>}
                </button>
                
                {/* User Mobile Quick Link */}
                <Link to="/settings" className="sm:hidden w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden">
                   {user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : <div className="text-lg">👤</div>}
                </Link>
            </div>

            {/* Notifications Popover */}
            {showNotifications && (
                <div className="absolute top-16 right-6 w-72 bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notifications</span>
                        <span className="text-[8px] text-blue-500">Live Sync</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">Clear Channel.</div>
                        ) : (
                            notifications.map((n: any) => (
                                <div key={n._id} className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => n.metadata?.fromId && setSelectedUserId(n.metadata.fromId)}>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${n.isRead ? 'bg-zinc-700' : 'bg-blue-500'}`}></div>
                                        <span className="text-[7px] font-bold text-zinc-500 uppercase">{n.type}</span>
                                    </div>
                                    <p className="text-xs text-zinc-300 group-hover:text-white transition-colors">{n.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </header>

        <main className="flex-1 overflow-y-auto bg-[#030712] relative scrollbar-hide">
             {/* Background noise/grain */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
            
            <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto pb-32">
                <Outlet />
            </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#09090b]/90 backdrop-blur-2xl border-t border-white/10 h-20 px-6 flex items-center justify-between z-[60] pb-safe">
            <Link to="/dashboard" className="flex flex-col items-center space-y-1 text-zinc-500 [&.active]:text-blue-500 transition-colors">
                <span className="text-xl">🏠</span>
                <span className="text-[8px] font-bold uppercase tracking-widest">Home</span>
            </Link>
            <Link to="/new-order" className="flex flex-col items-center space-y-1 text-zinc-500 [&.active]:text-blue-500 transition-colors">
                <span className="text-xl">🛍️</span>
                <span className="text-[8px] font-bold uppercase tracking-widest">Order</span>
            </Link>
            <div className="relative -top-6">
                <Link to="/add-funds" className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-xl shadow-blue-600/30 active:scale-90 border-4 border-[#030712]">
                    💳
                </Link>
            </div>
            <Link to="/tickets" className="flex flex-col items-center space-y-1 text-zinc-500 [&.active]:text-blue-500 transition-colors relative">
                <span className="text-xl">📩</span>
                <span className="text-[8px] font-bold uppercase tracking-widest">Help</span>
                {(unreadTickets + unreadLiveChat > 0) && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#09090b]"></span>}
            </Link>
            <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center space-y-1 text-zinc-500 transition-colors">
                <span className="text-xl">⚙️</span>
                <span className="text-[8px] font-bold uppercase tracking-widest">Menu</span>
            </button>
        </nav>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 z-[200] lg:hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#09090b] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                         <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 italic">Advanced Systems</span>
                         <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-500">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                         <div>
                            <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4 px-2">Social Hub</h4>
                            <div className="space-y-1">
                                <SidebarLink to="/orders" icon="📜">{t('order_log')}</SidebarLink>
                                <SidebarLink to="/irc" icon="👾">{t('irc_terminal')}</SidebarLink>
                                <SidebarLink to="/kyc" icon="🛡️">Identity Verification</SidebarLink>
                            </div>
                         </div>
                         {(user?.isAdmin || user?.isMod) && (
                            <div>
                                <h4 className="text-[9px] font-black text-red-500/50 uppercase tracking-widest mb-4 px-2">Root Control</h4>
                                <SidebarLink to="/admin" icon="⚙️">Admin Panel</SidebarLink>
                            </div>
                         )}
                    </div>
                    <div className="p-6 border-t border-white/5">
                        <button 
                            onClick={() => { sessionStorage.removeItem("bs_session_id"); void signOut(); }}
                            className="w-full py-4 bg-zinc-900 text-[10px] font-black text-red-500 uppercase tracking-[0.2em] rounded-xl border border-red-500/10 active:scale-95"
                        >
                            Terminate Node
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Community Chat - Desktop Only Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-[120] lg:relative lg:translate-x-0 transition-transform duration-700 bg-[#09090b] border-l border-white/5 h-full
        ${chatOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
          <CommunityChat
            mobileClose={() => setChatOpen(false)}
            onUserClick={(id) => setSelectedUserId(id)}
            externalTab={chatTab}
            onTabChange={setChatTab}
            externalPrivateUser={chatPrivateUser}
            onPrivateUserChange={setChatPrivateUser}
        />
      </aside>
    </div>
  )
}
