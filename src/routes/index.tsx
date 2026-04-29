import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 space-y-8 max-w-2xl animate-in fade-in zoom-in duration-1000">
        <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold text-blue-500 uppercase tracking-widest italic mb-4">
          Project Reset Successful
        </div>
        
        <h1 className="text-6xl lg:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
          Fresh <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Start</span>
        </h1>
        
        <p className="text-zinc-400 text-lg font-medium leading-relaxed italic uppercase tracking-tight">
          All previous code and databases have been purged. Your node is now a clean slate, ready for your new vision.
        </p>

        <div className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-8 bg-zinc-900/50 backdrop-blur-3xl border border-white/5 rounded-[32px] text-left hover:border-blue-500/30 transition-all group">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tight">Zero Dashboard</h3>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-loose">
              Direct access interface. No hidden panels.
            </p>
          </div>
          <div className="p-8 bg-zinc-900/50 backdrop-blur-3xl border border-white/5 rounded-[32px] text-left hover:border-blue-500/30 transition-all group">
            <div className="text-3xl mb-4">🔓</div>
            <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tight">No Login</h3>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-loose">
              Public network protocol. Immediate utility.
            </p>
          </div>
        </div>

        <div className="mt-16 text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic animate-pulse">
          Standing by for your new requirements...
        </div>
      </div>
    </div>
  )
}
