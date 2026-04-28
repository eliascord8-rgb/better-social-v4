import { createFileRoute, Link } from '@tanstack/react-router'
import { useI18n } from '../lib/i18n'
import type { Language } from '../lib/i18n'

export const Route = createFileRoute('/')({
  component: Home,
})

function LanguageSwitcher({ current, onSelect }: { current: Language, onSelect: (l: Language) => void }) {
    const flags: any = { en: "🇺🇸", de: "🇩🇪", sr: "🇷🇸" };
    return (
        <div className="flex items-center space-x-3">
            {(['en', 'de', 'sr'] as Language[]).map((l) => (
                <button 
                    key={l}
                    onClick={() => onSelect(l)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl border transition-all duration-500 ${current === l ? 'border-blue-500 bg-blue-500/20 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-white/5 bg-white/5 hover:border-white/20 opacity-40 hover:opacity-100 hover:scale-105'}`}
                >
                    {flags[l]}
                </button>
            ))}
        </div>
    );
}

function Home() {
  const { t, lang, setLang } = useI18n();

  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-zinc-100 selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* Interactive Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/60 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-[10px] font-black text-white group-hover:rotate-12 transition-all shadow-lg shadow-blue-600/30">BS</div>
            <span className="text-xl font-black text-white tracking-tighter uppercase italic">Better<span className="text-blue-500">Social</span></span>
          </Link>
          
          <div className="hidden lg:flex items-center space-x-8">
            <nav className="flex items-center space-x-8">
                {['Intelligence', 'Protocols', 'Pricing'].map(item => (
                    <a key={item} href="#" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">{item}</a>
                ))}
            </nav>
            <div className="h-4 w-px bg-white/10"></div>
            <LanguageSwitcher current={lang} onSelect={setLang} />
            <div className="flex items-center space-x-4">
                <Link to="/login" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition italic">{t('login')}</Link>
                <Link to="/register" className="px-6 py-3 bg-white text-zinc-950 text-[10px] font-black rounded-xl hover:bg-zinc-200 transition shadow-xl uppercase tracking-widest italic">{t('initialize')}</Link>
            </div>
          </div>

          <button className="lg:hidden w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">☰</button>
        </div>
      </header>

      <main className="relative z-10 pt-32 lg:pt-48 px-6">
        {/* Hero */}
        <section className="container mx-auto max-w-6xl pb-32">
            <div className="text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest italic">Aura Protocol Online</span>
                </div>
                
                <h1 className="text-6xl lg:text-[120px] font-black text-white uppercase italic tracking-tighter leading-[0.8] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    Hyper-Growth<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">Architecture</span>
                </h1>
                
                <p className="text-lg lg:text-2xl text-zinc-400 font-medium uppercase tracking-tight italic max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 leading-snug mx-auto lg:mx-0">
                    "The world's most sophisticated social engineering engine. Execute authority and establish network dominance with millisecond precision."
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-400">
                    <Link to="/register" className="group relative px-10 py-5 bg-blue-600 text-white text-xs font-black rounded-2xl shadow-2xl shadow-blue-600/30 active:scale-95 transition-all w-full sm:w-auto text-center">
                        <span className="uppercase tracking-[0.2em] italic">Start Transmission</span>
                    </Link>
                    <button className="px-10 py-5 bg-zinc-900 text-white text-xs font-black rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all w-full sm:w-auto uppercase tracking-[0.2em] italic backdrop-blur-md">
                        Network Specs
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-32">
                {[
                    { label: "Core Version", value: "v4.2.1 Stable", icon: "🧬" },
                    { label: "Network Latency", value: "8ms Optimization", icon: "⚡" },
                    { label: "System Uptime", value: "99.99% Guaranteed", icon: "💎" }
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-[32px] border border-white/5 hover:border-blue-500/20 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full group-hover:scale-150 transition-transform"></div>
                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-xl font-black text-white italic tracking-tighter">{stat.value}</div>
                    </div>
                ))}
            </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto max-w-6xl py-32 border-t border-white/5">
             <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
                <div className="max-w-xl">
                    <h2 className="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                        Sophisticated<br />
                        <span className="text-blue-500">Intelligence</span>
                    </h2>
                    <p className="text-sm lg:text-base text-zinc-500 font-bold uppercase tracking-widest italic">
                        Our engine processes massive data clusters to provide seamless, high-velocity social expansion that remains undetectable.
                    </p>
                </div>
                <div className="hidden lg:block text-8xl font-black text-white/[0.02] italic pointer-events-none select-none">DATA_ENGINE</div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: "Node Sync", desc: "Global platform synchronization.", icon: "🔄" },
                    { title: "Encryption", desc: "Masked identity transmissions.", icon: "🛡️" },
                    { title: "Instant", desc: "Zero-latency delivery protocols.", icon: "⚡" },
                    { title: "API Link", desc: "External framework integration.", icon: "🔗" }
                ].map((f, i) => (
                    <div key={i} className="p-8 bg-zinc-900/20 border border-white/5 rounded-3xl hover:bg-blue-600/5 hover:border-blue-500/20 transition-all">
                        <div className="text-2xl mb-4">{f.icon}</div>
                        <h3 className="text-sm font-black text-white uppercase italic mb-2">{f.title}</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">{f.desc}</p>
                    </div>
                ))}
             </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 bg-black/40 backdrop-blur-2xl relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
                <div className="max-w-xs">
                    <Link to="/" className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-[10px] font-black text-white">BS</div>
                        <span className="text-xl font-black text-white tracking-tighter uppercase italic">Better<span className="text-blue-500">Social</span></span>
                    </Link>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-loose italic">
                        The world's premium social engineering interface. Precision, speed, and absolute dominance.
                    </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-24">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Network</h4>
                        <div className="flex flex-col space-y-2">
                            {['Gateway', 'Protocols', 'Core'].map(item => (
                                <a key={item} href="#" className="text-[9px] font-bold text-zinc-600 hover:text-blue-500 transition uppercase tracking-widest italic">{item}</a>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Compliance</h4>
                        <div className="flex flex-col space-y-2">
                            {['Terms', 'Privacy', 'Masking'].map(item => (
                                <a key={item} href="#" className="text-[9px] font-bold text-zinc-600 hover:text-blue-500 transition uppercase tracking-widest italic">{item}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                <span>© 2026 BETTER SOCIAL INTERFACE [v4.2.1]</span>
                <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-emerald-500">Global Sync Optimal</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  )
}
