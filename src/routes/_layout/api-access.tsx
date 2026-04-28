import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute('/_layout/api-access')({
  component: ApiAccessPage,
})

function ApiAccessPage() {
  const { data: user } = useSuspenseQuery(convexQuery(api.users.currentUser, {}));

  return (
    <div className="space-y-12 max-w-4xl">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Developer Portal</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Connect your own systems to the Better-social engine.</p>
      </div>

      <div className="space-y-8">
        {/* API Link */}
        <div className="bg-[#161d2f] p-8 rounded-[40px] border border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight ml-1">HTTP Endpoint</h2>
            <div className="relative group">
                <input 
                    readOnly
                    disabled
                    value="https://better-social.convex.cloud/api/v2"
                    className="w-full px-6 py-4 bg-[#0a0f1e] border border-slate-800 text-blue-500 font-mono rounded-2xl cursor-not-allowed opacity-75"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700 uppercase tracking-widest">Global Node</span>
            </div>
            <p className="text-xs text-slate-500 font-medium ml-2">Base URL for all authenticated requests.</p>
        </div>

        {/* API Key */}
        <div className="bg-[#161d2f] p-8 rounded-[40px] border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between ml-1">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Secret API Key</h2>
                <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Regenerate Key</button>
            </div>
            <div className="relative">
                <input 
                    readOnly
                    disabled
                    value={user?._id ? `BS_LIVE_${user._id.slice(0, 12).toUpperCase()}_XXXX` : "LOADING_SECURE_TOKEN..."}
                    className="w-full px-6 py-4 bg-[#0a0f1e] border border-slate-800 text-blue-500 font-mono rounded-2xl cursor-not-allowed opacity-75 tracking-wider"
                />
                <button className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white transition cursor-pointer">📋</button>
            </div>
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                <p className="text-xs text-red-400 font-bold leading-relaxed flex items-center">
                    <span className="mr-2">⚠️</span> DO NOT SHARE THIS KEY. It provides full administrative access to your balance and orders.
                </p>
            </div>
        </div>
      </div>

      {/* Docs Link */}
      <div className="bg-blue-600 p-10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
        <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-2 italic uppercase">Standard SMM Documentation</h3>
            <p className="text-blue-100 font-medium opacity-80">Our API follows the global standard for SMM panels. Integrate in minutes.</p>
        </div>
        <button className="relative z-10 px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition shadow-xl uppercase text-xs italic tracking-widest">
            VIEW DOCS
        </button>
      </div>
    </div>
  )
}
