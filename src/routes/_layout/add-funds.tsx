import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/_layout/add-funds' as any)({
  component: AddFundsPage,
})

function AddFundsPage() {
  const redeemGiftcard = useMutation(api.users.redeemGiftcard);
  const createDeposit = useMutation(api.users.createCoinPaymentsDeposit);
  
  const [giftCode, setGiftCode] = useState("");
  const [depositAmount, setDepositAmount] = useState("100.00");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCode.trim()) return;
    
    setLoading(true);
    setStatus(null);
    try {
      const amount = await redeemGiftcard({ code: giftCode.trim() });
      setStatus({ type: 'success', message: `Successfully synchronized $${amount.toFixed(2)} to node balance.` });
      setGiftCode("");
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || "Failed to validate transmission code." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 5) {
        setStatus({ type: 'error', message: "Minimum refuel amount is $5.00" });
        return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const { txnId } = await createDeposit({ amount });
      setStatus({ type: 'success', message: `Deposit request ${txnId} initialized. Please complete payment via gateway.` });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || "Gateway synchronization failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="max-w-2xl">
          <div className="flex items-center space-x-2 mb-4">
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-bold text-blue-500 uppercase tracking-widest italic">Node Liquidity Interface</span>
              <div className="h-px w-8 bg-white/10"></div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
              Refuel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Balance</span>
          </h1>
          <p className="mt-4 text-zinc-500 text-sm font-medium leading-relaxed italic uppercase tracking-tight">
            Increase your node's operational capacity by synchronizing fresh capital into the network.
          </p>
      </div>

      {status && (
        <div className={`p-6 rounded-[24px] border animate-in slide-in-from-top-4 duration-500 ${
            status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
            <div className="flex items-center space-x-3">
                <span className="text-xl">{status.type === 'success' ? '✅' : '⚠️'}</span>
                <p className="text-[10px] font-black uppercase tracking-widest leading-loose italic">{status.message}</p>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Crypto Refuel */}
        <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl p-10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl border border-blue-500/20 group-hover:rotate-6 transition-transform">⚡</div>
                <div className="text-right">
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">Instant Sync</span>
                </div>
            </div>

            <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2 relative z-10">Crypto Gateway</h3>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-8 leading-relaxed italic relative z-10">
                Refuel via BTC, ETH, LTC or USDT. Massive 40% bonus on orders over $100.
            </p>

            <form onSubmit={handleDeposit} className="space-y-6 relative z-10">
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Refuel Amount (USD)</label>
                    <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 font-black italic">$</span>
                        <input 
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-3xl px-12 py-5 text-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner italic"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {['25', '50', '100', '500'].map(val => (
                        <button 
                            key={val}
                            type="button"
                            onClick={() => setDepositAmount(val + ".00")}
                            className="py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-zinc-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest"
                        >
                            ${val}
                        </button>
                    ))}
                </div>

                <button 
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 text-white text-[11px] font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all uppercase tracking-[0.2em] italic disabled:opacity-50 active:scale-95 flex items-center justify-center space-x-3"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>Establish Payment Link</span>}
                </button>
            </form>
        </div>

        {/* Gift Card Sync */}
        <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl p-10 group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-2xl border border-indigo-500/20 group-hover:-rotate-6 transition-transform">💎</div>
                <div className="text-right">
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest italic bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">Transmission Code</span>
                </div>
            </div>

            <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2 relative z-10">Secure Redemption</h3>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-8 leading-relaxed italic relative z-10">
                Synchronize capital via encrypted gift codes. Immediate allocation to node balance.
            </p>

            <form onSubmit={handleRedeem} className="space-y-6 relative z-10 mt-auto">
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Node Access Code</label>
                    <input 
                        type="text"
                        value={giftCode}
                        onChange={(e) => setGiftCode(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-3xl px-6 py-5 text-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-inner text-center uppercase tracking-widest placeholder:opacity-20 italic"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                    />
                </div>

                <button 
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white text-[11px] font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all uppercase tracking-[0.2em] italic disabled:opacity-50 active:scale-95 flex items-center justify-center space-x-3"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>Decrypt & Synchronize</span>}
                </button>
            </form>
        </div>
      </div>

      {/* Bonus Protocol */}
      <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent rounded-[32px] border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full"></div>
          <div className="flex items-center space-x-6 relative z-10">
              <div className="text-4xl animate-pulse">🌟</div>
              <div>
                  <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Bonus Protocol Active</h4>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic mt-1">Allocation phase: Tier 1 Elite. High-value syncs receive 40% surplus.</p>
              </div>
          </div>
          <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl relative z-10">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] italic">Surplus_Link_v4</span>
          </div>
      </div>
    </div>
  )
}
