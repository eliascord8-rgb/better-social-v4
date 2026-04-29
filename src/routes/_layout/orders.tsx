import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { Authenticated, Unauthenticated } from "convex/react";
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/orders')({
  component: OrdersPage,
})

function OrdersPage() {
  const navigate = useNavigate();
  return (
      <>
        <Authenticated>
            <OrdersContent />
        </Authenticated>
        <Unauthenticated>
            <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-[32px] shadow-xl border border-slate-100 max-w-md w-full animate-in zoom-in duration-300">
                    <div className="text-4xl mb-4">🔒</div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2 italic tracking-tight uppercase">Access Restricted</h1>
                    <p className="text-slate-500 mb-8 font-medium">Please authenticate to view your order history.</p>
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

function OrdersContent() {
  const { data: orders } = useSuspenseQuery(convexQuery(api.orders.getMyOrders, {}));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 italic tracking-tight">Order Log</h1>
            <p className="text-slate-500">Review historical service execution data.</p>
        </div>
        <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Requests</span>
            <span className="text-2xl font-black text-slate-900">{orders.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-6">ID</th>
                <th className="px-8 py-6">Service</th>
                <th className="px-8 py-6">Link</th>
                <th className="px-8 py-6">Quantity</th>
                <th className="px-8 py-6">Cost</th>
                <th className="px-8 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-medium">
                    No order records found in the current node session.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-8 py-6 font-mono text-[10px] text-slate-400 group-hover:text-blue-500 transition">
                      {order._id.slice(0, 8)}...
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-900 text-sm">
                      {order.serviceName}
                    </td>
                    <td className="px-8 py-6 font-medium text-slate-400 text-sm truncate max-w-[200px]">
                      {order.link}
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900 text-sm">
                      {order.quantity.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 font-black text-blue-600 text-sm">
                      ${order.cost.toFixed(2)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <StatusBadge status={order.status} />
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

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "bg-amber-50 text-amber-600 border-amber-100",
        completed: "bg-green-50 text-green-600 border-green-100",
        processing: "bg-blue-50 text-blue-600 border-blue-100",
        canceled: "bg-red-50 text-red-600 border-red-100",
    }
    
    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${styles[status] || styles.pending}`}>
            {status}
        </span>
    )
}
