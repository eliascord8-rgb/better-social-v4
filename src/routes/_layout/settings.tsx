import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/_layout/settings' as any)({
  component: SettingsPage,
})

function SettingsPage() {
  const user = useQuery(api.users.currentUser, {});
  const updateProfile = useMutation(api.users.updateProfile);
  
  const [username, setUsername] = useState(user?.username || "");
  const [image, setImage] = useState(user?.image || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await updateProfile({ username, image });
      setStatus("Node parameters synchronized successfully.");
    } catch (err: any) {
      setStatus("Sync error: " + (err.message || "Unknown failure"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-px w-8 bg-white/10"></div>
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-bold text-blue-500 uppercase tracking-widest italic">Identity Configuration</span>
              <div className="h-px w-8 bg-white/10"></div>
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
              Node <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Parameters</span>
          </h1>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>

          <form onSubmit={handleUpdate} className="space-y-8 relative z-10">
              <div className="flex flex-col items-center mb-10">
                  <div className="w-24 h-24 rounded-3xl bg-zinc-800 border-2 border-white/10 overflow-hidden mb-4 group-hover:border-blue-500/30 transition-all relative">
                      {image ? <img src={image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-[8px] font-bold uppercase text-white">Update Sync</div>
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Node ID: {user?._id?.slice(-8)}</span>
              </div>

              <div className="space-y-6">
                  <div className="space-y-3">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">System Alias</label>
                      <input 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold italic"
                          placeholder="Unique Identity"
                      />
                  </div>

                  <div className="space-y-3">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Profile Avatar Link</label>
                      <input 
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-mono italic"
                          placeholder="https://image-host.com/avatar.png"
                      />
                  </div>
              </div>

              {status && (
                <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[10px] text-blue-400 font-black text-center uppercase tracking-widest animate-shake">
                    {status}
                </div>
              )}

              <button 
                  disabled={loading}
                  className="w-full py-5 bg-white text-blue-950 text-[11px] font-black rounded-2xl shadow-xl hover:bg-slate-100 transition-all uppercase tracking-[0.2em] italic disabled:opacity-50 active:scale-95 flex items-center justify-center space-x-3"
              >
                  {loading ? <div className="w-4 h-4 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin"></div> : <span>Overwrite Parameters</span>}
              </button>
          </form>
      </div>

      <div className="bg-red-500/5 border border-red-500/10 rounded-[32px] p-8 flex items-center justify-between group hover:bg-red-500/10 transition-all">
          <div>
              <h4 className="text-sm font-bold text-red-400 uppercase italic tracking-tight">Node Termination</h4>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic mt-1">Irreversibly purge identity from core network.</p>
          </div>
          <button className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all cursor-pointer">Purge</button>
      </div>
    </div>
  )
}
