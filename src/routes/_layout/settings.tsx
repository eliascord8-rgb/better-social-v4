import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export const Route = createFileRoute('/_layout/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: user } = useSuspenseQuery(convexQuery(api.users.currentUser, {}));
  const updateProfile = useMutation(api.users.updateProfile);
  
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSync = async () => {
    setLoading(true);
    setStatus("");
    try {
        await updateProfile({ username });
        setStatus("SUCCESS: IDENTITY NODES SYNCED");
    } catch (err: any) {
        setStatus(`ERROR: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-12 max-w-4xl">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Identity Node</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium tracking-tight">Update your profile data and security encryption protocols.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-[#161d2f] p-8 rounded-[40px] border border-slate-800 shadow-2xl flex flex-col items-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
            <div className="relative group">
                <div className="w-32 h-32 bg-[#0a0f1e] rounded-[32px] border-2 border-slate-800 flex items-center justify-center text-4xl font-black overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-500">
                    {user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : user?.username?.slice(0, 2).toUpperCase()}
                </div>
                <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-2xl border-4 border-[#161d2f] flex items-center justify-center text-xs shadow-lg hover:bg-blue-500 transition cursor-pointer">
                    📸
                </button>
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">{user?.username || "Anonymous"}</h2>
                <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-full">

                    <span className="text-blue-500 font-black uppercase text-[10px] tracking-widest italic">Tier {user?.level || 1} Engine</span>
                </div>
            </div>
            <div className="w-full space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Engine Sync</span>
                    <span>35%</span>
                </div>
                <div className="w-full h-2 bg-[#0a0f1e] rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-blue-600 w-1/3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                </div>
            </div>
        </div>

        {/* General Settings */}
        <div className="md:col-span-2 space-y-8">
            <div className="bg-[#161d2f] p-8 rounded-[40px] border border-slate-800 shadow-2xl space-y-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic border-l-4 border-blue-600 pl-4">Profile Architecture</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Protocol Username</label>
                        <input 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-2 block w-full px-5 py-4 bg-[#0a0f1e] border border-slate-800 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition font-bold"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sync Email</label>
                        <input 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2 block w-full px-5 py-4 bg-[#0a0f1e] border border-slate-800 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition font-bold"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <button 
                        onClick={handleSync}
                        disabled={loading}
                        className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-900/20 text-xs italic tracking-widest uppercase disabled:opacity-50"
                    >
                        {loading ? "Syncing..." : "Sync Changes"}
                    </button>
                    {status && (
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${status.includes('SUCCESS') ? 'text-green-500' : 'text-red-500'}`}>
                            {status}
                        </span>
                    )}
                </div>
            </div>

            <div className="bg-[#161d2f] p-8 rounded-[40px] border border-slate-800 shadow-2xl space-y-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic text-red-500 border-l-4 border-red-600 pl-4">Access Overwrite</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                        <input 
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="mt-2 block w-full px-5 py-4 bg-[#0a0f1e] border border-slate-800 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Node Key</label>
                        <input 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-2 block w-full px-5 py-4 bg-[#0a0f1e] border border-slate-800 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                        />
                    </div>
                </div>
                <button className="px-10 py-4 border border-red-500/30 text-red-500 font-black rounded-2xl hover:bg-red-500 hover:text-white transition duration-300 text-xs uppercase italic tracking-widest">
                    Execute Security Protocol
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}
