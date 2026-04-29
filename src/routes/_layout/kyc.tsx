import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/_layout/kyc' as any)({
  component: KycPage,
})

function KycPage() {
  const user = useQuery(api.users.currentUser, {});
  const updateKyc = useMutation(api.users.updateKyc);
  
  const [docType, setDocType] = useState("Passport");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country.trim()) return;

    setLoading(true);
    try {
      await updateKyc({ docType, country });
      setStatus("Identity signal transmitted. Level 1 Elite verification pending.");
    } catch (err: any) {
      setStatus("Transmission error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.isKycVerified) {
      return (
          <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in duration-700">
              <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] border border-emerald-500/20 p-12 text-center max-w-lg w-full shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none"></div>
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 border border-emerald-500/30">🛡️</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Identity Verified</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] leading-loose italic">
                      Node Status: <span className="text-emerald-500">TRUSTED</span><br/>
                      Transmission privileges fully unlocked.
                  </p>
                  <div className="mt-10 pt-10 border-t border-white/5">
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Aura Security Protocol v4.0</span>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-px w-8 bg-white/10"></div>
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[8px] font-bold text-indigo-500 uppercase tracking-widest italic">Security Clearance</span>
              <div className="h-px w-8 bg-white/10"></div>
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
              Node <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-400">Verification</span>
          </h1>
          <p className="mt-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic leading-relaxed">
              Verify your physical identity to unlock high-priority network channels and increased withdrawal limits.
          </p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Document Type</label>
                      <select 
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all appearance-none cursor-pointer"
                      >
                          <option>Passport</option>
                          <option>National ID</option>
                          <option>Driver License</option>
                      </select>
                  </div>
                  <div className="space-y-3">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Node Location (Country)</label>
                      <input 
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all font-bold italic"
                          placeholder="United States"
                      />
                  </div>
              </div>

              <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-12 text-center group-hover:border-indigo-500/30 transition-all cursor-pointer">
                  <div className="text-3xl mb-4 opacity-40 group-hover:scale-110 transition-transform">📤</div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic leading-relaxed">
                      Upload Document Scan<br/>
                      <span className="text-[8px] opacity-60">PNG, JPG or PDF up to 10MB</span>
                  </p>
              </div>

              {status && (
                <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-[10px] text-indigo-400 font-black text-center uppercase tracking-widest italic animate-in slide-in-from-top-2">
                    {status}
                </div>
              )}

              <button 
                  disabled={loading}
                  className="w-full py-5 bg-indigo-600 text-white text-[11px] font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all uppercase tracking-[0.2em] italic disabled:opacity-50 active:scale-95 flex items-center justify-center space-x-3"
              >
                  {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>Initiate Verification Signal</span>}
              </button>
          </form>
      </div>

      <div className="flex items-start space-x-4 px-6 opacity-40">
          <span className="text-xl">🔒</span>
          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em] leading-loose italic">
              Your data is encrypted using military-grade AES-256 protocols. Better Social does not store raw identification documents after initial verification phase is completed.
          </p>
      </div>
    </div>
  )
}
