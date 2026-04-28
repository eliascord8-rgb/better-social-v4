import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute('/_layout/irc')({
  component: IrcPage,
})

function IrcPage() {
  const { data: messages } = useSuspenseQuery(convexQuery(api.chat.getMessages, {}));
  const sendMessage = useMutation(api.chat.sendMessage);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage({ message: input });
    setInput("");
  }

  return (
    <div className="space-y-6 md:space-y-12">
      <div className="px-4 md:px-0">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight italic uppercase">IRC Terminal</h1>
        <p className="text-slate-500 mt-2 text-base md:text-lg font-medium italic">High-bandwidth communication protocol.</p>
      </div>

      <div className="bg-[#161d2f] rounded-[30px] md:rounded-[40px] border border-slate-800 shadow-2xl flex flex-col h-[500px] md:h-[600px] overflow-hidden mx-4 md:mx-0">
        <div className="bg-slate-950/50 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Better-social // node_id: 08x44</div>
        </div>

        <div ref={scrollRef} className="flex-1 p-4 md:p-8 overflow-y-auto space-y-2 md:space-y-3 font-mono text-xs md:text-sm custom-scrollbar flex flex-col-reverse bg-[radial-gradient(circle_at_center,_#111827_0%,_#161d2f_100%)]">
            {messages.map((m: any) => (
                <div key={m._id} className="flex flex-col md:flex-row md:space-x-4 animate-in fade-in slide-in-from-left-1 py-1 md:py-0 border-b border-slate-800/10 md:border-0">
                    <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-slate-700 text-[10px] md:text-xs">[{new Date(m._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                        <span className={`font-black uppercase ${
                            m.role === 'admin' ? 'text-red-500' : 
                            m.role === 'system' ? 'text-blue-500' : 'text-blue-400'
                        }`}>&lt;{m.username}&gt;</span>
                    </div>
                    <span className={`text-slate-300 leading-relaxed break-words mt-1 md:mt-0 ${m.role === 'system' ? 'text-blue-500/80 italic' : ''}`}>{m.message}</span>
                </div>
            ))}
        </div>

        <div className="p-4 md:p-8 bg-[#0a0f1e]/50 border-t border-slate-800">
            <form onSubmit={handleSend} className="relative">
                <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-blue-500 font-mono text-xs font-bold">$</span>
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Input command..."
                    className="w-full bg-[#0a0f1e] border border-slate-800 rounded-2xl px-10 md:px-12 py-4 md:py-5 text-xs md:text-sm text-blue-400 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600 transition placeholder:text-slate-800"
                />
            </form>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 px-4 md:px-0">
        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Status:</span>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-pulse">Encrypted</span>
        </div>
        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Bitrate:</span>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">High-Fi</span>
        </div>
      </div>
    </div>
  )
}
