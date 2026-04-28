import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export const Route = createFileRoute('/_layout/tickets')({
  component: TicketsPage,
})

function TicketsPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  const { data: tickets } = useSuspenseQuery(convexQuery(api.tickets.getMyTickets, {}));
  const createTicket = useMutation(api.tickets.createTicket);
  const replyToTicket = useMutation(api.tickets.replyToTicket);
  const markRead = useMutation(api.tickets.markTicketRead);
  
  const ticketMessages = useQuery(api.tickets.getTicketMessages, selectedTicketId ? { ticketId: selectedTicketId } : "skip" as any) || [];

  const handleTransmit = async () => {
      if (!subject || !message) return;
      await createTicket({ subject, message });
      setSubject("");
      setMessage("");
      setIsOpen(false);
  }

  const handleReply = async () => {
      if (!replyText || !selectedTicketId) return;
      await replyToTicket({ ticketId: selectedTicketId, message: replyText });
      setReplyText("");
  }

  const openTicket = (id: any) => {
      setSelectedTicketId(id);
      markRead({ ticketId: id });
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Command Support</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Direct communication line with the Better-social Team.</p>
        </div>
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="px-8 py-4 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition duration-300 shadow-xl shadow-blue-900/20"
        >
            {isOpen ? "CANCEL REQUEST" : "NEW SUPPORT TICKET"}
        </button>
      </div>

      {isOpen && (
        <div className="bg-[#161d2f] p-8 rounded-[40px] border border-blue-500/30 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-white mb-6 italic uppercase tracking-tighter">Open New Transmission</h2>
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject / Area</label>
                    <input 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Order #12345 issue"
                        className="mt-2 block w-full px-5 py-4 bg-[#0a0f1e] border border-slate-800 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Detailed Log</label>
                    <textarea 
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Explain the situation in detail..."
                        className="mt-2 block w-full px-5 py-4 bg-[#0a0f1e] border border-slate-800 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                </div>
                <button 
                    onClick={handleTransmit}
                    className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-900/20 uppercase text-xs italic tracking-widest"
                >
                    TRANSMIT TICKET
                </button>
            </div>
        </div>
      )}

      <div className="bg-[#161d2f] rounded-[40px] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight italic uppercase">Communication History</h2>
            {selectedTicketId && (
                <button 
                    onClick={() => setSelectedTicketId(null)}
                    className="text-[10px] font-black text-slate-500 uppercase hover:text-white transition"
                >
                    BACK TO LIST
                </button>
            )}
        </div>
        
        {tickets.length === 0 ? (
            <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 border border-slate-800">✉️</div>
                <h3 className="text-xl font-bold text-white mb-2 italic">Zero active tickets</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm">Your communication history is clean. All previous issues have been resolved.</p>
            </div>
        ) : selectedTicketId ? (
            <div className="flex flex-col h-[500px]">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {ticketMessages.map((m: any) => (
                        <div key={m._id} className={`flex flex-col ${m.isAdmin ? 'items-start' : 'items-end'}`}>
                            <div className={`max-w-[80%] p-5 rounded-[24px] ${
                                m.isAdmin 
                                ? 'bg-blue-600/10 border border-blue-500/20 text-blue-100 rounded-tl-none' 
                                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tr-none'
                            }`}>
                                <p className="text-sm leading-relaxed">{m.message}</p>
                            </div>
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-2 px-1">
                                {m.isAdmin ? 'BETTER-SOCIAL ADMIN' : 'YOU'} • {new Date(m._creationTime).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="p-6 bg-slate-900/50 border-t border-slate-800">
                    <div className="flex space-x-3">
                        <input 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 bg-[#0a0f1e] border border-slate-800 px-6 py-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                        <button 
                            onClick={handleReply}
                            className="px-8 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-500 transition shadow-lg shadow-blue-900/20 uppercase tracking-widest"
                        >
                            SEND
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="divide-y divide-slate-800">
                {tickets.map(t => (
                    <div key={t._id} className="p-8 hover:bg-slate-900/30 transition flex items-center justify-between group">
                        <div className="flex items-center space-x-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${t.hasUnreadAdminReply ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-900 text-slate-600'}`}>
                                {t.hasUnreadAdminReply ? '🔔' : '✉️'}
                            </div>
                            <div>
                                <div className="flex items-center space-x-3 mb-1">
                                    <h3 className="font-bold text-white uppercase tracking-tight">{t.subject}</h3>
                                    {t.hasUnreadAdminReply && (
                                        <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-[8px] font-black rounded uppercase animate-pulse">NEW ANSWER</span>
                                    )}
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Status: <span className={t.status === 'open' ? 'text-green-500' : 'text-slate-500'}>{t.status}</span> • Last Sync: {new Date(t.lastUpdate).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => openTicket(t._id)}
                            className="px-6 py-3 bg-slate-800 text-white text-[10px] font-black rounded-xl hover:bg-blue-600 transition uppercase tracking-widest shadow-lg"
                        >
                            Open Log
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}

