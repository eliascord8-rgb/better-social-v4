import React from 'react'
import ReactDOM from 'react-dom/client'
import { getRouter } from './router'
import { RouterProvider } from '@tanstack/react-router'
import './styles/app.css'

function SafeMount() {
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
