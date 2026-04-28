import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuthActions } from "@convex-dev/auth/react";
import React, { useState } from "react";

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const { signIn } = useAuthActions();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaPassed) {
        setError("Please verify you are not a robot.");
        return;
    }
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    (data as any).flow = "signUp";
    
    signIn("password", data)
      .then(() => {
        sessionStorage.removeItem("bs_session_id");
        // We use a delay to ensure the session is synced across the system
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 1500);
      })
      .catch((err) => {
        console.error("Registration error:", err);
        setError(err.message || "Could not create account. Email might already be in use.");
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] px-6 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse delay-700"></div>

      <div className="max-w-md w-full bg-zinc-900/40 backdrop-blur-3xl p-8 lg:p-12 rounded-[40px] border border-white/5 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-[10px] font-black text-white group-hover:rotate-12 transition-all shadow-lg shadow-blue-600/30">BS</div>
            <span className="text-xl font-black text-white tracking-tighter uppercase italic">Better<span className="text-blue-500">Social</span></span>
          </Link>
          
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
            Establish Node
          </h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">
            Join the digital social infrastructure.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Network Identity</label>
              <input
                name="username"
                type="text"
                required
                className="w-full px-5 py-4 bg-zinc-950 border border-white/5 text-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                placeholder="Unique identifier"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Sync Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-5 py-4 bg-zinc-950 border border-white/5 text-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                placeholder="identity@network.com"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Creation Date</label>
                  <input
                    name="birthday"
                    type="date"
                    required
                    className="w-full px-5 py-4 bg-zinc-950 border border-white/5 text-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                  />
                </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Access Phrase</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full px-5 py-4 bg-zinc-950 border border-white/5 text-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                placeholder="Min. 8 characters"
              />
            </div>
          </div>

          <div className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input 
                    type="checkbox" 
                    id="captcha" 
                    onChange={(e) => setCaptchaPassed(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-white/10 bg-zinc-900 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" 
                />
                <label htmlFor="captcha" className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest cursor-pointer select-none">Intelligence Check</label>
              </div>
          </div>

          {error && (
            <div className="text-red-400 text-[9px] text-center font-bold uppercase tracking-widest bg-red-400/5 py-3 px-4 rounded-xl border border-red-400/20 animate-in shake italic">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white text-[11px] font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-[0.2em] italic disabled:opacity-50 active:scale-95 flex items-center justify-center space-x-3"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>Execute Registration</span>}
          </button>
        </form>
        
        <div className="text-center mt-10">
            <div className="h-px bg-white/5 w-full mb-8"></div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Authenticated Identity?{' '}
                <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors italic ml-1">
                    Establish Connection
                </Link>
            </p>
        </div>
      </div>
    </div>
  )
}
