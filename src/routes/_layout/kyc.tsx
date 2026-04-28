import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";

export const Route = createFileRoute('/_layout/kyc')({
  component: KycPage,
})

const COUNTRIES = [
    "United States", "United Kingdom", "Germany", "France", "Canada", "Australia", 
    "Brazil", "Japan", "India", "China", "Russia", "Netherlands", "Switzerland",
    "Sweden", "Norway", "Denmark", "Finland", "Italy", "Spain", "Mexico",
    "Argentina", "Chile", "Colombia", "Peru", "Turkey", "Saudi Arabia", "UAE",
    "South Africa", "Nigeria", "Egypt", "Indonesia", "Malaysia", "Thailand",
    "Vietnam", "Philippines", "Singapore", "South Korea", "Portugal", "Belgium",
    "Austria", "Greece", "Poland", "Czech Republic", "Hungary", "Romania", "Ukraine"
];

function KycPage() {
    const user = useQuery(api.users.currentUser, {});
    const updateKyc = useMutation(api.users.updateKyc);
    const navigate = useNavigate();
    
    const [docType, setDocType] = useState("ID");
    const [country, setCountry] = useState("United States");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user?.isKycVerified) {
            navigate({ to: '/dashboard' });
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateKyc({ docType, country });
            navigate({ to: '/dashboard' });
        } catch (err) {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="bg-[#161d2f] border border-slate-800 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-[24px] border border-blue-500/30 flex items-center justify-center text-3xl mx-auto mb-6">
                        🛡️
                    </div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Identity Node Verification</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium uppercase tracking-widest">Protocol Required for Advanced Engine Features</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Select Document Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {["ID", "PASSPORT", "DRIVER LICENSE", "VISA"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setDocType(type)}
                                        className={`py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                                            docType === type 
                                            ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40" 
                                            : "bg-[#0a0f1e] border-slate-800 text-slate-500 hover:border-slate-600"
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Select Country</label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full bg-[#0a0f1e] border border-slate-800 text-white font-bold text-sm px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition appearance-none"
                            >
                                {COUNTRIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-6 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black rounded-3xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-widest italic disabled:opacity-50"
                    >
                        {submitting ? "Synchronizing..." : "Initiate Verification"}
                    </button>

                    <p className="text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                        By initiating, you agree to our automated verification protocols.<br/>
                        Processing time: Instant to 24 hours.
                    </p>
                </form>
            </div>
        </div>
    );
}
