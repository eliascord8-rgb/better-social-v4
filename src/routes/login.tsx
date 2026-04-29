import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, type FormEvent } from 'react'
import { useConvex } from "convex/react";
import { api } from '../../convex/_generated/api';

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const convex = useConvex();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    try {
      // Resolve username to email if necessary using a query
      const email = await convex.query(api.users.resolveIdentifier, { identifier });
      
      await signIn("password", { email: email || identifier, password, flow: "signIn" });
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase mb-2">Terminal Access</h1>
          <p className="text-slate-500 font-medium">Synchronize node credentials to establish link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Username or Email</label>
            <input
              name="identifier"
              type="text"
              required
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 font-bold text-slate-900 shadow-sm"
              placeholder="System Identity"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Passkey</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 font-bold text-slate-900 shadow-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-sm font-bold text-center animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {loading ? "Establishing Link..." : "Authenticate Node"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-4">New to the Network?</p>
          <Link to="/register" className="text-blue-600 font-black hover:underline uppercase tracking-widest text-xs">
            Establish New Node (Register)
          </Link>
        </div>
      </div>
    </div>
  )
}
