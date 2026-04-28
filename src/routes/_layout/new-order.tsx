import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import React, { useState, useMemo, useEffect } from "react";

export const Route = createFileRoute('/_layout/new-order')({
  component: NewOrderPage,
})

function NewOrderPage() {
  const categories = useQuery(api.orders.getCategories, {});
  const submitOrder = useMutation(api.orders.submitOrder);
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("");
  
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const rawServices = useQuery(
    api.orders.getServicesByCategory, 
    selectedCategory ? { category: selectedCategory } : "skip" as any
  ) || [];

  // Filter for only Service 7242
  const services = useMemo(() => {
    return rawServices.filter(s => s.externalId === "7242");
  }, [rawServices]);

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selectedService = useMemo(() => {
    return services.find(s => s._id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  useEffect(() => {
    if (services.length > 0 && !services.find(s => s._id === selectedServiceId)) {
        setSelectedServiceId(services[0]._id);
    }
  }, [services, selectedServiceId]);

  const totalPrice = useMemo(() => {
    if (!selectedService || !quantity) return 0;
    return (Number(selectedService.rate) / 1000) * quantity;
  }, [selectedService, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !link || quantity <= 0) {
        setMessage("Error: Please fill all fields correctly.");
        return;
    }

    setLoading(true);
    setMessage("");
    try {
        await submitOrder({
            serviceId: selectedServiceId as any,
            quantity,
            link
        });
        setMessage("Transmission successful! Signal queued in the network.");
        setLink("");
        setQuantity(0);
        setTimeout(() => navigate({ to: "/orders" }), 2000);
    } catch (err: any) {
        setMessage("Error: " + err.message);
    } finally {
        setLoading(false);
    }
  }

  const filteredCategories = useMemo(() => {
    return categories;
  }, [categories]);

  if (categories === undefined) {
      return (
          <div className="flex items-center justify-center py-32">
              <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
      );
  }

  if (categories.length === 0) {
      return (
          <div className="text-center py-32 bg-zinc-900/40 rounded-[40px] border border-white/5 shadow-2xl animate-in zoom-in">
              <div className="w-20 h-20 bg-zinc-950 border border-white/5 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl">📡</div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Network Offline</h2>
              <p className="text-zinc-500 mt-2 font-bold uppercase text-[9px] tracking-widest">Awaiting synchronization of global infrastructure.</p>
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-zinc-900/40 p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Signal <span className="text-blue-500">Deployment</span></h1>
          <p className="text-zinc-500 mt-1.5 text-[9px] font-bold uppercase tracking-widest">Configure high-frequency social protocols.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900/40 rounded-[32px] border border-white/5 p-8 lg:p-10 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Protocol Category</label>
                <div className="relative">
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block w-full px-5 py-4 bg-zinc-950 border border-white/5 text-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition appearance-none font-bold text-sm"
                    >
                        {filteredCategories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 text-xs">▼</div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Signal Prototype</label>
                <div className="relative">
                    <select 
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="block w-full px-5 py-4 bg-zinc-950 border border-white/5 text-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition appearance-none font-bold text-sm"
                    >
                        {services.length > 0 ? services.map(s => (
                            <option key={s._id} value={s._id}>
                                {s.name} - ${s.rate}/1k
                            </option>
                        )) : (
                            <option disabled value="">No active signals</option>
                        )}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 text-xs">▼</div>
                </div>
            </div>
        </div>

        {selectedService && (
            <div className="bg-zinc-950/60 p-6 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 relative group">
                <div className="space-y-1">
                    <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Protocol ID</div>
                    <div className="text-white font-bold italic tracking-tight">{selectedService.externalId}</div>
                </div>
                <div className="space-y-1 border-y md:border-y-0 md:border-x border-white/5 py-3 md:py-0 md:px-6">
                    <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Range</div>
                    <div className="text-blue-500 font-bold italic tracking-tight">{selectedService.min} — {selectedService.max}</div>
                </div>
                <div className="space-y-1 md:text-right">
                    <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Rate (1k)</div>
                    <div className="text-white font-bold italic tracking-tight text-base">${selectedService.rate}</div>
                </div>
            </div>
        )}

        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Target Destination</label>
                <input 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://www.social.com/p/..."
                    className="block w-full px-5 py-4 bg-zinc-950 border border-white/5 text-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition font-medium italic text-sm"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Deployment Quantity</label>
                <input 
                    type="number"
                    value={quantity || ""}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder={`Min: ${selectedService?.min || 100}`}
                    className="block w-full px-5 py-4 bg-zinc-950 border border-white/5 text-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition font-medium italic text-sm"
                    required
                />
            </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Fuel Requirement</span>
                <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-white italic tracking-tighter">${totalPrice.toFixed(3)}</span>
                    <span className="text-[8px] text-blue-500 font-bold uppercase animate-pulse">Ready</span>
                </div>
            </div>
            <button 
                type="submit"
                disabled={loading || !selectedService}
                className="w-full md:w-auto px-12 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 uppercase text-[10px] italic tracking-widest active:scale-95"
            >
                {loading ? "PROCESSING..." : "EXECUTE DEPLOYMENT"}
            </button>
        </div>

        {message && (
            <div className={`p-4 rounded-xl font-bold text-[9px] uppercase tracking-widest text-center animate-in slide-in-from-top-4 ${message.startsWith("Error") ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"}`}>
                {message}
            </div>
        )}
      </form>
    </div>
  )
}
