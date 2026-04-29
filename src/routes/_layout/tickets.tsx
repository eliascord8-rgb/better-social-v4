import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_layout/tickets')({
  component: TicketsPage,
})

function TicketsPage() {
  const navigate = useNavigate();
  return (
      <>
        <Authenticated>
            <TicketsContent />
        </Authenticated>
        <Unauthenticated>
            <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-[32px] shadow-xl border border-slate-100 max-w-md w-full animate-in zoom-in duration-300">
                    <div className="text-4xl mb-4">🔒</div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2 italic tracking-tight uppercase">Access Restricted</h1>
                    <p className="text-slate-500 mb-8 font-medium">Authentication required to access the support terminal.</p>
                    <button 
                        onClick={() => navigate({ to: '/login' })}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg"
                    >
                        Access Terminal
                    </button>
                </div>
            </div>
        </Unauthenticated>
      </>
  )
}

function TicketsContent() {
  const { data: tickets } = useSuspenseQuery(convexQuery(api.tickets.getMyTickets, {}));
  const createTicket = useMutation(api.tickets.createTicket);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setLoading(true);
    try {
        await createTicket({ subject, message });
        setSubject("");
        setMessage("");
        setShowForm(false);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 italic tracking-tight">Support Core</h1>
            <p className="text-slate-500">Initialize a communication channel with network administrators.</p>
        </div>
        <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
            {showForm ? "Close Terminal" : "New Transmission"}
        </button>
      </div>

      {showForm && (
          <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 animate-in slide-in-from-top-4 duration-300">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Subject</label>
                    <input 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                        placeholder="Transmission Topic"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data Payload</label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={4}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                        placeholder="Detailed message regarding your inquiry..."
                    />
                </div>
                <button 
                    disabled={loading}
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs disabled:opacity-50"
                >
                    {loading ? "Transmitting..." : "Send to Core"}
                </button>
              </form>
          </div>
      )}

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-6">ID</th>
                <th className="px-8 py-6">Subject</th>
                <th className="px-8 py-6">Last Update</th>
                <th className="px-8 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">
                    No active support transmissions found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket: any) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-8 py-6 font-mono text-[10px] text-slate-400">
                      {ticket._id.slice(0, 8)}
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-900 text-sm">
                      {ticket.subject}
                    </td>
                    <td className="px-8 py-6 font-medium text-slate-400 text-xs">
                      {new Date(ticket.lastUpdate).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            ticket.status === 'open' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                            {ticket.status}
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
