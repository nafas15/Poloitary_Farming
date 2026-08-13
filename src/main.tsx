import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Prevent scrolling on number inputs globally
document.addEventListener('wheel', (e) => {
  if (document.activeElement && (document.activeElement as HTMLInputElement).type === 'number') {
    e.preventDefault();
  }
}, { passive: false });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

