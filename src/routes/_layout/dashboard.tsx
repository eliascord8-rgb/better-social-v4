import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/_layout/dashboard')({
  component: Dashboard,
})

function StatCard({ label, value, trend, icon, color }: { label: string, value: string | number, trend: string, icon: string, color: string }) {
    return (
        <div className="bg-zinc-900/40 backdrop-blur-2xl p-6 rounded-[32px] border border-white/5 hover:border-blue-500/20 transition-all duration-500 group relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${color.replace('text-', 'bg-')}/10 border border-white/5 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className="bg-white/5 px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-white/5">
                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                    <span className="text-[7px] font-bold text-blue-400 uppercase tracking-widest">{trend}</span>
                </div>
            </div>
            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 opacity-60">{label}</div>
            <div className="text-2xl font-black text-white italic tracking-tighter drop-shadow-sm">{value}</div>
        </div>
    )
}

function Dashboard() {
  const { data: user } = useSuspenseQuery(convexQuery(api.users.currentUser, {}));
  const orders = useQuery(api.orders.getMyOrders, {}) || [];
  
  const stats = [
    { label: "Active Nodes", value: orders.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled').length, trend: "+12%", icon: "🛰️", color: "text-blue-500" },
    { label: "Total Invested", value: `${((user as any)?.totalDeposited || 0).toFixed(2)}`, trend: "Stable", icon: "💎", color: "text-indigo-500" },
    { label: "Elite Level", value: (user as any)?.level || 1, trend: "Ascending", icon: "🧬", color: "text-emerald-500" },
    { label: "Network XP", value: ((user as any)?.exp || 0).toLocaleString(), trend: "+240 XP", icon: "🌟", color: "text-amber-500" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
              <div className="flex items-center space-x-2 mb-4">
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-bold text-blue-500 uppercase tracking-widest italic">Aura Intelligence Active</span>
                  <div className="h-px w-8 bg-white/10"></div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                  Welcome Back,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">{user?.username}</span>
              </h1>
          </div>
          <div className="hidden lg:block text-right">
              <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1 italic">Network Synchronization</div>
              <div className="text-lg font-black text-white italic tracking-tighter tabular-nums">LIVE_FEED: v4.2.1</div>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[32px] border border-white/5 shadow-2xl overflow-hidden group relative">
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none"></div>
                  <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10">
                      <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-widest italic">Recent Transmissions</h3>
                          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Local Node Archive</p>
                      </div>
                      <Link to="/orders" className="text-[9px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors italic border-b border-blue-500/10 pb-0.5">View Archive</Link>
                  </div>
                  <div className="overflow-x-auto scrollbar-hide relative z-10">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="bg-white/[0.01]">
                                  <th className="px-8 py-4 text-[8px] font-bold text-zinc-500 uppercase tracking-widest italic">Node ID</th>
                                  <th className="px-8 py-4 text-[8px] font-bold text-zinc-500 uppercase tracking-widest italic">Service Protocol</th>
                                  <th className="px-8 py-4 text-[8px] font-bold text-zinc-500 uppercase tracking-widest italic">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {orders.length === 0 ? (
                                  <tr>
                                      <td colSpan={3} className="px-8 py-20 text-center">
                                          <div className="text-3xl mb-4 opacity-20">📡</div>
                                          <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">No active telemetry found.</div>
                                      </td>
                                  </tr>
                              ) : (
                                  orders.slice(0, 5).map((order: any) => (
                                      <tr key={order._id} className="hover:bg-white/[0.02] transition-colors group/row">
                                          <td className="px-8 py-4 text-[9px] font-bold text-zinc-500 tabular-nums uppercase">#{order._id.slice(-6)}</td>
                                          <td className="px-8 py-4 text-[11px] font-bold text-white group-hover/row:text-blue-400 transition-colors uppercase italic">{order.serviceName}</td>
                                          <td className="px-8 py-4">
                                              <span className={`px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest italic border ${
                                                  order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                  order.status === 'pending' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                  'bg-zinc-800 text-zinc-500 border-white/5'
                                              }`}>
                                                  {order.status}
                                              </span>
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-600/10 p-8 rounded-[32px] border border-blue-500/20 shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-all">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[50px] rounded-full group-hover:scale-150 transition-transform"></div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">Initialize New Transmission</h3>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed italic mb-6">
                          Establish social dominance with millisecond precision.
                      </p>
                      <Link to="/new-order" className="w-full py-4 bg-blue-600 text-white text-[9px] font-black rounded-xl shadow-xl hover:bg-blue-500 transition-all uppercase tracking-widest italic text-center block">Initiate Sync</Link>
                  </div>

                  <div className="bg-zinc-900/40 p-8 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-all">
                      <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-4 italic">Support Node Online</h4>
                      <div className="flex items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold text-zinc-100 uppercase italic">Elite Technicians Active</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed italic mb-6">
                          Response interval: 120s. Monitoring global node status.
                      </p>
                      <Link to="/tickets" className="text-blue-500 text-[9px] font-bold uppercase tracking-widest hover:text-blue-400 transition-colors italic block">Open Support Signal →</Link>
                  </div>
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-zinc-900/40 p-6 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-widest italic">Platform Activity</h4>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                  </div>
                  <div className="space-y-5">
                      {[
                          { node: "Node_842", act: "Sync Successful", time: "2m" },
                          { node: "Node_129", act: "Ascended Elite", time: "5m" },
                          { node: "Node_901", act: "Transmission Initiated", time: "8m" }
                      ].map((log, i) => (
                          <div key={i} className="flex items-center justify-between">
                              <div>
                                  <div className="text-[10px] font-bold text-white uppercase italic">{log.node}</div>
                                  <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{log.act}</div>
                              </div>
                              <div className="text-[8px] text-blue-500 font-bold tabular-nums italic">{log.time}</div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-indigo-600/10 p-8 rounded-[32px] border border-indigo-500/20 shadow-xl relative overflow-hidden group">
                  <div className="text-3xl mb-4 animate-bounce">🧬</div>
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2 leading-none">Neural Protocol</h3>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed italic mb-6">
                      Synchronize with the network for massive rewards.
                  </p>
                  <Link to="/dashboard" className="text-indigo-500 text-[9px] font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors italic block">Return to Node →</Link>
              </div>
          </div>
      </div>
    </div>
  )
}
