import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute('/_layout/orders')({
  component: MyOrdersPage,
})

function MyOrdersPage() {
  const { data: orders } = useSuspenseQuery(convexQuery(api.orders.getMyOrders, {}));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase text-blue-500">Mission Logs</h1>
          <p className="text-zinc-500 mt-1 text-sm font-bold uppercase tracking-widest">Historical archive of all deployments.</p>
        </div>
      </div>

      <div className="bg-zinc-900/40 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-[8px] uppercase text-zinc-500 font-bold tracking-widest border-b border-white/5">
                    <tr>
                        <th className="px-8 py-5">Timestamp</th>
                        <th className="px-8 py-5">Protocol</th>
                        <th className="px-8 py-5">Target</th>
                        <th className="px-8 py-5">Quantity</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Fuel Used</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {orders.map((order: any) => (
                        <tr key={order._id} className="hover:bg-blue-500/[0.02] transition-colors group">
                            <td className="px-8 py-6 text-zinc-500 font-bold text-[10px] whitespace-nowrap tabular-nums">
                                {new Date(order._creationTime).toLocaleDateString()} {new Date(order._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-8 py-6 text-zinc-200 font-bold text-xs italic uppercase tracking-tight">{order.serviceName}</td>
                            <td className="px-8 py-6">
                                <a 
                                    href={order.link} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-blue-500 hover:text-blue-400 font-mono text-[10px] truncate block max-w-[150px]"
                                >
                                    {order.link}
                                </a>
                            </td>
                            <td className="px-8 py-6 text-zinc-300 font-black tabular-nums text-xs">{order.quantity.toLocaleString()}</td>
                            <td className="px-8 py-6">
                                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full border ${
                                    order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    order.status === 'processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                    order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    'bg-zinc-800 text-zinc-500 border-white/5'
                                }`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-8 py-6 text-white font-black text-right tabular-nums text-xs">${order.cost.toFixed(2)}</td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-8 py-32 text-center text-zinc-600 italic font-bold text-[10px] uppercase tracking-widest">
                                Archive Empty. Awaiting deployment.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}
