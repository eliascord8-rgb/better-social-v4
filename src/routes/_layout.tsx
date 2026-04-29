import { createFileRoute, Outlet, Link, useNavigate } from '@tanstack/react-router'
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from '../../convex/_generated/api';

export const Route = createFileRoute('/_layout')({
  component: GlobalLayout,
})

function GlobalLayout() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const user = useQuery(api.users.currentUser);

  return (
    <main>
      <Authenticated>
        <div className="flex min-h-screen bg-slate-50 font-sans">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
            <div className="p-6 border-b border-slate-100">
              <Link to="/" className="text-xl font-black text-blue-600 tracking-tighter">
                CORE<span className="text-slate-900">APP</span>
              </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <SidebarLink to="/dashboard" label="Dashboard" icon="📊" />
              <SidebarLink to="/new-order" label="New Order" icon="🛒" />
              <SidebarLink to="/orders" label="Order Log" icon="📋" />
              <SidebarLink to="/tickets" label="Support Core" icon="🎧" />
            </nav>

            <div className="p-4 border-t border-slate-100 space-y-4">
              <div className="px-4 py-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                <p className="text-lg font-black text-slate-900">${((user as any)?.balance || 0).toFixed(2)}</p>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  navigate({ to: '/login' });
                }}
                className="w-full py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition text-center"
              >
                Logout
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 capitalize italic tracking-tight">
                {(user as any)?.username || 'Authenticated Node'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {(user as any)?.username?.slice(0, 1).toUpperCase()}
                </div>
              </div>
            </header>

            <div className="p-8 max-w-5xl w-full mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </Authenticated>

      <Unauthenticated>
         <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-white">Access Restricted</h1>
                <p className="text-slate-400">Please authorize your node to proceed.</p>
                <Link to="/login" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">
                    Login
                </Link>
            </div>
         </div>
      </Unauthenticated>
    </main>
  )
}

function SidebarLink({ to, label, icon }: { to: string, label: string, icon: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition [&.active]:bg-blue-50 [&.active]:text-blue-600 shadow-sm"
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  )
}
