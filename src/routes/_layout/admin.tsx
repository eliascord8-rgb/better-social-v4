import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation, useQuery, useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/_layout/admin' as any)({
  component: AdminPanelPage,
})

function AdminPanelPage() {
  const navigate = useNavigate();
  const user = useQuery(api.users.currentUser, {});
  const settings = useQuery(api.admin.getSettings, {});
  const saveSettings = useMutation(api.admin.saveSettings);
  const fetchServices = useAction(api.admin.fetchServices);
  const setMaintenance = useMutation(api.admin.setMaintenanceMode);
  const maintenanceMode = useQuery(api.admin.getMaintenanceMode);
  
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.isAdmin && !user.isMod) {
        navigate({ to: '/dashboard' });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (settings) {
        setApiUrl(settings.apiUrl);
        setApiKey(settings.apiKey);
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await saveSettings({ apiUrl, apiKey });
        setStatus("Root API configurations updated.");
    } catch (err: any) {
        setStatus("Config error: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleFetch = async () => {
    setLoading(true);
    setStatus("Synchronizing service protocol from external node...");
    try {
        await fetchServices({});
        setStatus("Service matrix successfully synchronized.");
    } catch (err: any) {
        setStatus("Sync failure: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  if (!user?.isAdmin && !user?.isMod) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
          <div className="max-w-2xl">
              <div className="flex items-center space-x-2 mb-4">
                  <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-[8px] font-bold text-red-500 uppercase tracking-widest italic">Root Access Level</span>
                  <div className="h-px w-8 bg-white/10"></div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                  Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400">Center</span>
              </h1>
          </div>
          <div className="text-right">
              <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1 italic">Administrative Node</div>
              <div className="text-sm font-black text-red-500 italic tracking-tighter tabular-nums uppercase">UID: {user?._id?.slice(-6)}</div>
          </div>
      </div>

      {status && (
        <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[24px] text-[10px] text-blue-400 font-black text-center uppercase tracking-[0.2em] italic animate-in slide-in-from-top-4">
            {status}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              {/* API Configuration */}
              <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                  
                  <div className="flex items-center space-x-4 mb-8 relative z-10">
                      <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-xl border border-red-500/20">⚙️</div>
                      <div>
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Root API Protocol</h3>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic">Global service synchronization layer</p>
                      </div>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6 relative z-10">
                      <div className="space-y-3">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">API Endpoint URL</label>
                          <input 
                              value={apiUrl}
                              onChange={(e) => setApiUrl(e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-600 transition-all shadow-inner italic"
                              placeholder="https://provider.com/api/v2"
                          />
                      </div>

                      <div className="space-y-3">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Master Authorization Key</label>
                          <input 
                              type="password"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-600 transition-all shadow-inner italic"
                              placeholder="••••••••••••••••"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <button 
                              type="submit"
                              disabled={loading}
                              className="py-4 bg-white text-red-950 text-[10px] font-black rounded-xl shadow-xl hover:bg-slate-100 transition-all uppercase tracking-widest italic disabled:opacity-50 active:scale-95 cursor-pointer"
                          >
                              Commit Config
                          </button>
                          <button 
                              type="button"
                              onClick={handleFetch}
                              disabled={loading || !settings}
                              className="py-4 bg-red-600 text-white text-[10px] font-black rounded-xl shadow-xl hover:bg-red-500 transition-all uppercase tracking-widest italic disabled:opacity-50 active:scale-95 cursor-pointer"
                          >
                              Fetch Service Matrix
                          </button>
                      </div>
                  </form>
              </div>

              {/* Maintenance Control */}
              <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl p-10 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-xl border border-amber-500/20">🚧</div>
                          <div>
                              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">System Quarantine</h3>
                              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic">Toggle global maintenance mode</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => setMaintenance({ enabled: !maintenanceMode })}
                        className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            maintenanceMode 
                            ? 'bg-amber-500 text-black hover:bg-amber-400' 
                            : 'bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700'
                        }`}
                      >
                        {maintenanceMode ? 'DEACTIVATE' : 'ACTIVATE'}
                      </button>
                  </div>
              </div>
          </div>

          <div className="space-y-8">
              {/* Node Stats */}
              <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl p-8 relative overflow-hidden group">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic mb-6 border-b border-white/5 pb-4">Network Telemetry</h4>
                  <div className="space-y-6">
                      <AdminStat label="Total Nodes" value="1,402" icon="👥" />
                      <AdminStat label="Active Streams" value="84" icon="🌊" />
                      <AdminStat label="Node Uptime" value="14d 2h" icon="⏲️" />
                      <AdminStat label="Total Liquidity" value="$12,402" icon="💰" />
                  </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-b from-red-600/10 to-transparent rounded-[40px] border border-red-500/10 p-8">
                  <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic mb-6">Critical Actions</h4>
                  <div className="space-y-3">
                      <QuickAction label="Clear Global Logs" color="bg-red-500" />
                      <QuickAction label="Broadcast System Alert" color="bg-amber-500" />
                      <QuickAction label="Reset Bot Node" color="bg-blue-500" />
                  </div>
              </div>
          </div>
      </div>
    </div>
  )
}

function AdminStat({ label, value, icon }: { label: string, value: string, icon: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <span className="text-lg opacity-50">{icon}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{label}</span>
            </div>
            <span className="text-sm font-black text-white italic">{value}</span>
        </div>
    )
}

function QuickAction({ label, color }: { label: string, color: string }) {
    return (
        <button className="w-full py-4 px-6 bg-zinc-900 border border-white/5 rounded-xl text-[9px] font-black text-zinc-400 uppercase tracking-widest text-left flex items-center justify-between group hover:border-white/10 hover:text-white transition-all">
            <span>{label}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${color} group-hover:animate-ping`}></div>
        </button>
    )
}
