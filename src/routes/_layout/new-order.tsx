import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/_layout/new-order')({
  component: NewOrderPage,
})

function NewOrderPage() {
  const navigate = useNavigate();
  return (
      <>
        <Authenticated>
            <NewOrderContent />
        </Authenticated>
        <Unauthenticated>
            <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-[32px] shadow-xl border border-slate-100 max-w-md w-full animate-in zoom-in duration-300">
                    <div className="text-4xl mb-4">🔒</div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2 italic tracking-tight uppercase">Access Restricted</h1>
                    <p className="text-slate-500 mb-8 font-medium">Authentication required to access the order terminal.</p>
                    <button 
                        onClick={() => navigate({ to: '/login' })}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg"
                    >
                        Access Terminal
                    </button>
                </div>
            </div>
        </Unauthenticated>
      </>
  )
}

function NewOrderContent() {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: categories } = useSuspenseQuery(convexQuery(api.orders.getCategories, {})) as { data: string[] };
  const { data: services } = useSuspenseQuery(
      convexQuery(api.orders.getServicesByCategory, { category: selectedCategory || (categories[0] || "") })
  ) as { data: any[] };

  const submitOrder = useMutation(api.orders.submitOrder);

  const selectedService = services.find(s => s._id === selectedServiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) {
        setError("Please select a service");
        return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
        await submitOrder({
            serviceId: selectedServiceId as any,
            quantity,
            link,
        });
        setSuccess("Order submitted successfully!");
        setLink("");
        setQuantity(0);
    } catch (err: any) {
        setError(err.message || "Failed to submit order");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 max-w-2xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 italic tracking-tight">New Order</h1>
          <p className="text-slate-500">Initialize a new service request to the network core.</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
                ⚠️ {error}
            </div>
        )}

        {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-sm font-bold">
                ✅ {success}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedServiceId("");
                }}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 font-bold text-slate-900 appearance-none shadow-sm cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Service</label>
              <select 
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                disabled={!selectedCategory}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 font-bold text-slate-900 appearance-none shadow-sm cursor-pointer disabled:opacity-50"
              >
                <option value="">Select Service</option>
                {services.map(svc => (
                    <option key={svc._id} value={svc._id}>{svc.name} - ${svc.rate}/1k</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Description</label>
              <div className="w-full px-6 py-5 rounded-2xl border border-slate-200 bg-slate-50 min-h-[120px] text-slate-500 text-sm font-medium leading-relaxed border-dashed">
                {selectedService ? (
                    <div className="space-y-2">
                        <p className="font-bold text-slate-900">Execution Specs:</p>
                        <p>• Rate: ${selectedService.rate} per 1,000 units</p>
                        <p>• Limits: {selectedService.min} - {selectedService.max}</p>
                        <p>• Type: {selectedService.type}</p>
                    </div>
                ) : (
                    "Select a service to view detailed execution parameters and system requirements..."
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Link / URL</label>
              <input
                type="url"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com/target-node"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 font-bold text-slate-900 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Quantity</label>
              <input
                type="number"
                required
                min={selectedService ? Number(selectedService.min) : 0}
                max={selectedService ? Number(selectedService.max) : 999999}
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="0"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 font-bold text-slate-900 shadow-sm"
              />
              {selectedService && (
                  <p className="mt-2 text-xs font-bold text-slate-400">
                    ESTIMATED COST: <span className="text-blue-600">${((Number(selectedService.rate) / 1000) * quantity).toFixed(4)}</span>
                  </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50">
            <button
              type="submit"
              disabled={loading || !selectedServiceId}
              className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Processing Request...
                  </>
              ) : 'Submit Request to Core'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
