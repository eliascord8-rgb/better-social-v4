import React from 'react'
import ReactDOM from 'react-dom/client'
import { getRouter } from './router'
import { RouterProvider } from '@tanstack/react-router'
import './styles/app.css'

function SafeMount() {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL
  
  if (!CONVEX_URL) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-[32px] p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-black text-white uppercase italic tracking-tight mb-4">System Critical Error</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The environment variable <code className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded">VITE_CONVEX_URL</code> is missing. 
            The interface cannot establish a connection to the network core.
          </p>
          <div className="p-4 bg-slate-900 rounded-2xl text-left text-[10px] font-mono text-slate-500 mb-6">
            ERROR_CODE: NULL_BACKEND_LINK<br/>
            SOURCE: NETLIFY_ENV_VARS
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-400 transition uppercase text-[10px] tracking-widest"
          >
            Retry Synchronization
          </button>
        </div>
      </div>
    )
  }

  try {
    const router = getRouter()
    return <RouterProvider router={router} />
  } catch (err) {
    console.error('Mount error:', err)
    return (
      <div style={{ padding: '20px', color: 'red', background: '#111', minHeight: '100vh' }}>
        <h1>FATAL BOOT ERROR</h1>
        <pre>{err instanceof Error ? err.message : String(err)}</pre>
        <p>Check browser console and Netlify environment variables (VITE_CONVEX_URL).</p>
      </div>
    )
  }
}

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SafeMount />
    </React.StrictMode>,
  )
}
