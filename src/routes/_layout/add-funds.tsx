import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export const Route = createFileRoute('/_layout/add-funds')({
  component: AddFundsPage,
})

function AddFundsPage() {
    const redeemGiftcard = useMutation(api.users.redeemGiftcard);
    const createDeposit = useMutation(api.users.createCoinPaymentsDeposit);
    const simulateSuccess = useMutation(api.users.simulateCompleteDeposit);
    const myDeposits = useQuery(api.users.getMyDeposits, {}) || [];

    const [giftCode, setGiftCode] = useState("");
    const [amount, setAmount] = useState<number>(100);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!giftCode.trim()) return;
        setLoading(true);
        try {
            const credited = await redeemGiftcard({ code: giftCode.trim() });
            setMessage(`SUCCESS: Credited ${credited.toFixed(2)}.`);
            setGiftCode("");
        } catch (err: any) {
            setMessage("ERROR: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (amount < 5) {
            setMessage("ERROR: Min $5.00");
            return;
        }
        setLoading(true);
        try {
            const { txnId } = await createDeposit({ amount });
            setMessage(`INITIALIZED: TXID ${txnId}. Syncing...`);
        } catch (err: any) {
            setMessage("ERROR: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                    Balance <span className="text-blue-500">Refueling</span>
                </h1>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest italic">
                    Synchronize assets to accelerate social ascension.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Crypto Card */}
                    <div className="bg-zinc-900/40 backdrop-blur-2xl p-8 lg:p-10 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-[80px] rounded-full"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Crypto Protocol</div>
                                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-xl">⚡</div>
                            </div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Automatic Refuel</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed mb-8">
                                Deposit USD via top-tier cryptocurrencies. High-fidelity sync.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Amount (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 font-black text-sm">$</span>
                                        <input 
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="w-full bg-zinc-950 border border-white/5 text-white rounded-2xl px-10 py-5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                                            placeholder="100.00"
                                        />
                                    </div>
                                    <div className="flex justify-between px-1">
                                        <span className="text-[7px] font-bold text-zinc-600 uppercase italic">Min: $5.00</span>
                                        {amount >= 100 && <span className="text-[7px] font-bold text-emerald-500 uppercase animate-pulse italic">+40% Bonus</span>}
                                    </div>
                                </div>

                                <button 
                                    onClick={handleDeposit}
                                    disabled={loading}
                                    className="w-full py-5 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-xl hover:bg-blue-500 transition-all uppercase tracking-widest italic active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? "INITIALIZING..." : "GENERATE DEPOSIT ADDRESS"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Voucher Card */}
                    <div className="bg-zinc-900/40 p-8 lg:p-10 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Voucher Redemption</h3>
                            <form onSubmit={handleRedeem} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Code</label>
                                    <input 
                                        type="text"
                                        value={giftCode}
                                        onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                                        className="w-full bg-zinc-950 border border-white/5 text-white rounded-2xl px-6 py-5 text-[10px] font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                                        placeholder="BS-XXXX-XXXX-XXXX"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-white text-black text-[10px] font-black rounded-2xl shadow-xl hover:bg-zinc-200 transition-all uppercase tracking-widest italic active:scale-95 disabled:opacity-50"
                                >
                                    REDEEM CODE
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Status/Message Log */}
                    <div className="bg-zinc-950 p-6 rounded-[32px] border border-white/5 shadow-inner h-[120px] overflow-y-auto scrollbar-hide">
                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-4 flex items-center space-x-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></span>
                            <span>Telemetry Log</span>
                        </div>
                        {message ? (
                            <div className={`p-3 rounded-xl text-[9px] font-bold uppercase tracking-widest leading-relaxed italic border ${message.startsWith('ERROR') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                {message}
                            </div>
                        ) : (
                            <div className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest italic text-center mt-4">
                                Awaiting sequence...
                            </div>
                        )}
                    </div>

                    {/* Pending Node Synchronizations */}
                    <div className="bg-zinc-900/40 rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Transaction History</h3>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5 scrollbar-hide">
                            {myDeposits.length === 0 ? (
                                <div className="p-10 text-center opacity-30">
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Empty</div>
                                </div>
                            ) : (
                                myDeposits.map((d: any) => (
                                    <div key={d._id} className="p-5 hover:bg-white/[0.01] transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="text-[10px] font-bold text-white italic tracking-tight">${d.total.toFixed(2)} USD</div>
                                                <div className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{d.method} // {d.txnId.slice(0,10)}...</div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest italic ${
                                                    d.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                    d.status === 'pending' ? 'bg-blue-500/10 text-blue-500 animate-pulse' : 
                                                    'bg-zinc-800 text-zinc-500'
                                                }`}>
                                                    {d.status}
                                                </span>
                                            </div>
                                        </div>
                                        {d.status === 'pending' && (
                                            <button 
                                                onClick={() => simulateSuccess({ txnId: d.txnId })}
                                                className="mt-2 w-full py-2 bg-emerald-500/10 text-emerald-500 text-[7px] font-bold rounded-lg border border-emerald-500/20 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all italic"
                                            >
                                                Simulate Success
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
