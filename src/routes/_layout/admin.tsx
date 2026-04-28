import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute('/_layout/admin')({
  component: AdminPage,
})

function UserControlCenter() {
    const users = useQuery(api.admin.getAllUsers, {});
    const updateUser = useMutation(api.admin.updateUserAdmin);
    const kickUser = useMutation(api.admin.kickUser);
    const sendAlert = useMutation(api.admin.sendDirectAlert);

    const [editingUser, setEditingUser] = useState<any>(null);
    const [alertMessage, setAlertMessage] = useState("");

    const handleUpdate = async (userId: any, updates: any) => {
        try {
            await updateUser({ targetUserId: userId, updates });
            alert("User updated successfully.");
        } catch(e: any) {
            alert(e.message);
        }
    };

    const handleKick = async (userId: any) => {
        if (confirm("Execute node termination? User will be kicked instantly.")) {
            await kickUser({ targetUserId: userId });
        }
    };

    const handleSendAlert = async (userId: any) => {
        if (!alertMessage) return;
        await sendAlert({ targetUserId: userId, message: alertMessage });
        setAlertMessage("");
        alert("Alert transmitted.");
    };

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900/40 rounded-[32px] border border-white/5 p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] rounded-full"></div>
                <h3 className="text-lg font-black text-white uppercase italic mb-6 relative z-10">User Identity Management</h3>
                <div className="overflow-x-auto scrollbar-hide relative z-10">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] text-[8px] uppercase text-zinc-500 font-bold tracking-widest border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Balance</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[10px]">
                            {users?.map(u => (
                                <tr key={u._id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-zinc-100 font-bold">{u.username}</div>
                                        <div className="text-zinc-600 text-[8px]">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold ${u.isBanned ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {u.isBanned ? 'BANNED' : 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-blue-400 font-bold">${(u.balance || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => setEditingUser(u)} className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white transition uppercase text-[8px] font-bold">Edit</button>
                                        <button onClick={() => handleKick(u._id)} className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition uppercase text-[8px] font-bold">Kick</button>
                                        <button onClick={() => handleUpdate(u._id, { isBanned: !u.isBanned })} className="px-2 py-1 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition uppercase text-[8px] font-bold">
                                            {u.isBanned ? 'Unban' : 'Ban'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingUser && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-zinc-900 border border-white/10 p-8 lg:p-12 rounded-[40px] max-w-xl w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <h2 className="text-xl font-black text-white uppercase italic mb-8">Override Node: {editingUser.username}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block ml-1">Node Balance</label>
                                <div className="flex space-x-2">
                                    <input 
                                        type="number" 
                                        defaultValue={editingUser.balance}
                                        id="edit-balance"
                                        className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500" 
                                    />
                                    <button onClick={() => handleUpdate(editingUser._id, { balance: Number((document.getElementById('edit-balance') as HTMLInputElement).value) })} className="bg-blue-600 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-white">Set</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block ml-1">Emergency Signal</label>
                                <div className="flex space-x-2">
                                    <input 
                                        value={alertMessage}
                                        onChange={(e) => setAlertMessage(e.target.value)}
                                        placeholder="Alert payload..."
                                        className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500" 
                                    />
                                    <button onClick={() => handleSendAlert(editingUser._id)} className="bg-indigo-600 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-white">Send</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => setEditingUser(null)} className="w-full py-4 bg-zinc-800 text-zinc-500 font-bold rounded-2xl uppercase tracking-widest text-[9px] hover:text-white transition">Dismiss Override Interface</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function LiveChatCenter() {
    const sessions = useQuery(api.liveChat.getActiveSessions, {});
    const { data: user } = useSuspenseQuery(convexQuery(api.users.currentUser, {}));
    const [selectedSessionId, setSelectedSessionId] = useState<any>(null);
    const messages = useQuery(api.liveChat.getMessages, selectedSessionId ? { sessionId: selectedSessionId } : "skip" as any);
    const sendMessage = useMutation(api.liveChat.sendMessage);
    const joinSession = useMutation(api.liveChat.joinSession);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedSessionId && user?.username) {
            joinSession({ sessionId: selectedSessionId, operatorName: user.username });
        }
    }, [selectedSessionId, user?.username]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedSessionId) return;
        await sendMessage({
            sessionId: selectedSessionId,
            senderName: user?.username || "Admin",
            message: input.trim(),
            isAdmin: true,
        });
        setInput("");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
            <div className="bg-zinc-950 rounded-3xl border border-white/5 overflow-y-auto divide-y divide-white/5 scrollbar-hide">
                {sessions?.map(s => (
                    <button 
                        key={s._id}
                        onClick={() => setSelectedSessionId(s._id)}
                        className={`w-full p-5 text-left hover:bg-blue-600/5 transition ${selectedSessionId === s._id ? 'bg-blue-600/10' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{s.guestId.slice(0, 10)}...</div>
                            {s.operatorName && (
                                <div className="text-[7px] font-bold text-green-500 bg-green-500/10 px-1 rounded uppercase">Staff: {s.operatorName}</div>
                            )}
                        </div>
                        <div className="text-xs text-zinc-400 truncate">{s.lastMessage || "No messages"}</div>
                        <div className="text-[7px] text-zinc-600 mt-1 uppercase">{new Date(s._creationTime).toLocaleString()}</div>
                    </button>
                ))}
            </div>
            <div className="md:col-span-2 bg-zinc-950 rounded-3xl border border-white/5 flex flex-col overflow-hidden">
                {selectedSessionId ? (
                    <>
                        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide">
                            {messages?.map(m => (
                                <div key={m._id} className={`flex ${m.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs shadow-xl ${m.isAdmin ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-300 rounded-tl-none'}`}>
                                        <div className="text-[7px] font-bold uppercase opacity-50 mb-1">{m.senderName}</div>
                                        {m.message}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSend} className="p-4 bg-zinc-900 border-t border-white/5">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Push root response..."
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-30 text-zinc-500">
                         <div className="text-4xl">📡</div>
                         <div className="text-[9px] font-bold uppercase tracking-widest">Select Session Node</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TicketCenter() {
    const tickets = useQuery(api.tickets.getAllTicketsAdmin, {});
    const [selectedTicketId, setSelectedTicketId] = useState<any>(null);
    const messages = useQuery(api.tickets.getTicketMessages, selectedTicketId ? { ticketId: selectedTicketId } : "skip" as any);
    const replyToTicket = useMutation(api.tickets.replyToTicket);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedTicketId) return;
        await replyToTicket({
            ticketId: selectedTicketId,
            message: input.trim(),
        });
        setInput("");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
            <div className="bg-zinc-950 rounded-3xl border border-white/5 overflow-y-auto divide-y divide-white/5 scrollbar-hide">
                {tickets?.map(t => (
                    <button 
                        key={t._id}
                        onClick={() => setSelectedTicketId(t._id)}
                        className={`w-full p-5 text-left hover:bg-blue-600/5 transition ${selectedTicketId === t._id ? 'bg-blue-600/10' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest truncate max-w-[120px]">{t.subject}</div>
                            <div className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase ${t.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                {t.status}
                            </div>
                        </div>
                        <div className="text-[7px] text-zinc-600 mt-1 uppercase">{new Date(t.lastUpdate).toLocaleString()}</div>
                    </button>
                ))}
            </div>
            <div className="md:col-span-2 bg-zinc-950 rounded-3xl border border-white/5 flex flex-col overflow-hidden">
                {selectedTicketId ? (
                    <>
                        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide">
                            {messages?.map(m => (
                                <div key={m._id} className={`flex ${m.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs shadow-xl ${m.isAdmin ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-300 rounded-tl-none'}`}>
                                        <div className="text-[7px] font-bold uppercase opacity-50 mb-1">{m.isAdmin ? "Staff" : "Client"}</div>
                                        {m.message}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSend} className="p-4 bg-zinc-900 border-t border-white/5">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Response payload..."
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-30 text-zinc-500">
                         <div className="text-4xl">✉️</div>
                         <div className="text-[9px] font-bold uppercase tracking-widest">Select Ticket Channel</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AdminPage() {
  const { data: settings } = useSuspenseQuery(convexQuery(api.admin.getSettings, {}));
  const isMaintenance = useQuery(api.admin.getMaintenanceMode, {}) || false;
  const setMaintenance = useMutation(api.admin.setMaintenanceMode);
  
  const saveSettings = useMutation(api.admin.saveSettings);
  const fetchServices = useAction(api.admin.fetchServices);
  
  const [url, setUrl] = useState(settings?.apiUrl || "");
  const [key, setKey] = useState(settings?.apiKey || "");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const [activeTab, setActiveTab] = useState("api");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await saveSettings({ apiUrl: url, apiKey: key });
        setMessage("Settings saved successfully!");
    } catch (err: any) {
        setMessage("Error: " + err.message);
    } finally {
        setLoading(false);
    }
  }

  const handleSync = async () => {
    setSyncing(true);
    setMessage("Syncing services from API...");
    try {
        await fetchServices();
        setMessage("Services synced successfully!");
    } catch (err: any) {
        setMessage("Error: " + err.message);
    } finally {
        setSyncing(false);
    }
  }

  const toggleMaintenance = async () => {
      try {
          await setMaintenance({ enabled: !isMaintenance });
          alert(`Maintenance mode: ${!isMaintenance ? 'ENABLED' : 'DISABLED'}`);
      } catch(e: any) {
          alert(e.message);
      }
  };

  const [massMailMessage, setMassMailMessage] = useState("");
  const handleMassMail = () => {
      if (!massMailMessage) return;
      alert(`PROTOCOLS INITIALIZED: Mass Mailing encrypted signal to all network nodes.`);
      setMassMailMessage("");
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic text-red-500">Root Terminal</h1>
          <p className="text-zinc-500 mt-1 font-bold uppercase text-[9px] tracking-widest italic opacity-60">Full system override enabled.</p>
        </div>
        <button 
            onClick={toggleMaintenance}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest italic transition-all duration-500 border ${isMaintenance ? 'bg-red-500 text-white border-red-400 animate-pulse' : 'bg-zinc-900 text-zinc-500 border-white/5'}`}
        >
            {isMaintenance ? 'MAINTENANCE: ON' : 'TOGGLE MAINTENANCE'}
        </button>
      </div>

      <div className="bg-zinc-900/40 p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
          <h3 className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest mb-6 italic">Network Broadcast Signal</h3>
          <div className="flex flex-col md:flex-row gap-4 relative z-10">
              <textarea 
                value={massMailMessage}
                onChange={(e) => setMassMailMessage(e.target.value)}
                placeholder="Transmission payload..."
                className="flex-1 bg-zinc-950 border border-white/5 rounded-2xl p-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                rows={2}
              />
              <button 
                onClick={handleMassMail}
                className="px-10 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest italic shadow-xl shadow-red-900/20 active:scale-95 cursor-pointer"
              >
                  Execute Broadcast
              </button>
          </div>
      </div>

      <div className="flex space-x-4 border-b border-white/5 overflow-x-auto pb-px scrollbar-hide">
          {["api", "users", "livechat", "tickets"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 cursor-pointer ${activeTab === tab ? "text-blue-500 border-blue-500" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === "api" && (
        <div className="bg-zinc-900/40 rounded-[32px] border border-white/5 p-8 lg:p-12 shadow-2xl animate-in slide-in-from-left-4 duration-500">
            <h2 className="text-xl font-black text-white mb-8 italic uppercase tracking-tighter">Provider Configuration</h2>
            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">API Endpoint</label>
                        <input 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-950 border border-white/5 text-white font-mono rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Secret Key</label>
                        <input 
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            type="password"
                            className="w-full px-5 py-4 bg-zinc-950 border border-white/5 text-white font-mono rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition text-xs"
                        />
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] italic cursor-pointer">Save Settings</button>
                    <button type="button" onClick={handleSync} disabled={syncing} className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black rounded-2xl uppercase text-[10px] italic cursor-pointer">Sync Services</button>
                </div>
            </form>
            {message && <div className="mt-8 text-center text-[10px] font-bold text-blue-500 uppercase italic">{message}</div>}
        </div>
      )}

      {activeTab === "users" && <UserControlCenter />}
      {activeTab === "livechat" && <LiveChatCenter />}
      {activeTab === "tickets" && <TicketCenter />}
    </div>
  )
}
