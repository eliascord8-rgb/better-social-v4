import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/_layout/irc' as any)({
  component: IrcTerminalPage,
})

function IrcTerminalPage() {
  const user = useQuery(api.users.currentUser, {});
  const messages = useQuery(api.chat.getMessages, {}) || [];
  const sendMessage = useMutation(api.chat.sendMessage);
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isMuted = user?.muteUntil && user.muteUntil > Date.now();

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isMuted) return;
    
    await sendMessage({ message: input.trim() });
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
          <div className="max-w-2xl">
              <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-bold text-blue-500 uppercase tracking-widest italic">Global Communications Protocol</span>
                  <div className="h-px w-8 bg-white/10"></div>
              </div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                  IRC <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Terminal</span>
              </h1>
          </div>
          <div className="text-right hidden sm:block">
              <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1 italic">Network Uptime</div>
              <div className="text-sm font-black text-green-500 italic tracking-tighter tabular-nums">99.999% OPERATIONAL</div>
          </div>
      </div>

      <div className="flex-1 bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl flex flex-col overflow-hidden relative group">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none"></div>
          
          <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10 bg-white/[0.01]">
              <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Live Encrypted Feed</span>
              </div>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest italic">Node: {user?.username || 'GUEST'}</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide relative z-10">
              {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <div className="text-5xl mb-4">💬</div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Initializing Buffer...</p>
                  </div>
              ) : (
                  messages.map((m: any) => (
                      <div key={m._id} className="group animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex items-center space-x-3 mb-2">
                              <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                                  m.role === 'admin' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                                  m.role === 'system' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                  'bg-zinc-800 text-zinc-500'
                              }`}>
                                  {m.role}
                              </div>
                              <span className="font-black text-white text-xs italic tracking-tight">{m.username}</span>
                              <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                  {new Date(m._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                          </div>
                          <div className={`ml-3 pl-4 border-l-2 py-1 transition-all group-hover:border-blue-500/50 ${
                              m.role === 'system' ? 'border-blue-500/20 italic text-blue-400/80' : 'border-white/5 text-zinc-300'
                          }`}>
                              <p className="text-sm font-medium leading-relaxed break-words">{m.message}</p>
                          </div>
                      </div>
                  ))
              )}
          </div>

          <div className="p-8 bg-black/40 border-t border-white/5 relative z-10">
              {isMuted && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-500 font-black text-center uppercase tracking-widest italic animate-pulse">
                      Critical Error: Transmission Access Revoked. Muted until system reset.
                  </div>
              )}
              <form onSubmit={handleSend} className="relative">
                  <input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={!!isMuted}
                      placeholder={isMuted ? "TRANSMISSION DENIED" : "Input network command or message..."}
                      className="w-full bg-black/60 border border-white/10 rounded-3xl px-8 py-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600 pr-20 placeholder-zinc-700 font-medium shadow-inner transition-all hover:border-white/20"
                  />
                  <button 
                      type="submit" 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white hover:bg-blue-500 transition-all active:scale-90 shadow-xl shadow-blue-900/40 cursor-pointer group"
                  >
                      <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">➤</span>
                  </button>
              </form>
              <div className="mt-4 flex items-center justify-center space-x-6 opacity-30">
                  <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">P2P Encrypted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">No Logs Protocol</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  )
}
