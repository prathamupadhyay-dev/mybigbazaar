import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Vite dynamic import error handler (Handles stale chunk hashes after deployments)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('New deployment detected / stale chunk error. Reloading page...', event)
  window.location.reload()
})

window.addEventListener('error', (event) => {
  const msg = event?.message || ''
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('error loading dynamically imported module')
  ) {
    console.warn('Dynamic import failed. Reloading to get latest build assets...')
    const hasReloaded = sessionStorage.getItem('global_chunk_reload')
    if (!hasReloaded) {
      sessionStorage.setItem('global_chunk_reload', 'true')
      window.location.reload()
    }
  }
})

// Clear reload flag on clean startup
sessionStorage.removeItem('global_chunk_reload')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
