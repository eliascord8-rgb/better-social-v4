import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { Authenticated, Unauthenticated } from "convex/react";

export const Route = createFileRoute('/_layout/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate();
  return (
      <>
        <Authenticated>
            <DashboardContent />
        </Authenticated>
        <Unauthenticated>
            <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-[32px] shadow-xl border border-slate-100 max-w-md w-full animate-in zoom-in duration-300">
                    <div className="text-4xl mb-4">🔒</div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2 italic tracking-tight uppercase">Access Restricted</h1>
                    <p className="text-slate-500 mb-8 font-medium">This terminal requires an established node connection. Please authenticate to proceed.</p>
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

function DashboardContent() {
  const { data: user } = useSuspenseQuery(convexQuery(api.users.currentUser, {})) as { data: any };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 italic tracking-tight">
          System Overview
        </h1>
        <p className="text-slate-500">
          Welcome back, <span className="text-blue-600 font-bold">{user?.username || user?.name}</span>. Node status: <span className="text-green-600 font-bold uppercase text-xs tracking-widest ml-2">Synchronized</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Balance" value={`$${(user?.balance || 0).toFixed(2)}`} />
        <StatCard label="Level" value={user?.level || 1} />
        <StatCard label="Experience" value={(user?.exp || 0).toLocaleString()} />
      </div>

      <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6 italic tracking-tight">Account Parameters</h2>
        <div className="space-y-4">
          <DetailRow label="Identifier" value={user?.email} />
          <DetailRow label="Node ID" value={user?._id} isMono />
          <DetailRow label="Initialization" value={user?._creationTime ? new Date(user._creationTime).toLocaleDateString() : 'N/A'} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string, value: any }) {
    return (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 group hover:border-blue-200 transition">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-400 transition">{label}</p>
          <p className="text-4xl font-black text-slate-900">{value}</p>
        </div>
    )
}

function DetailRow({ label, value, isMono }: { label: string, value: any, isMono?: boolean }) {
    return (
        <div className="flex justify-between py-4 border-b border-slate-50 last:border-0">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={`font-bold text-slate-900 ${isMono ? 'font-mono text-xs text-slate-400' : ''}`}>{value}</span>
        </div>
    )
}
