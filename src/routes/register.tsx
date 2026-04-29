import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, type FormEvent } from 'react'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      console.log("Starting registration for:", email, username);
      await signIn("password", { email, username, password, flow: "signUp" });
      console.log("Registration successful, redirecting...");
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase mb-2">Establish Node</h1>
          <p className="text-slate-500 font-medium">Initialize your presence in the core network.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">System Alias</label>
            <input
              name="username"
              type="text"
              required
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 font-bold text-slate-900 shadow-sm"
              placeholder="Unique Identifier"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Communications Link (Email)</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 font-bold text-slate-900 shadow-sm"
              placeholder="node@network.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Secure Passkey</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 font-bold text-slate-900 shadow-sm"
              placeholder="Min. 8 characters"
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
            {loading ? "Initializing..." : "Create Node Identity"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-4">Already Synchronized?</p>
          <Link to="/login" className="text-blue-600 font-black hover:underline uppercase tracking-widest text-xs">
            Access Terminal (Login)
          </Link>
        </div>
      </div>
    </div>
  )
}
