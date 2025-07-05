import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StoreProvider } from '@/features/core/stores/StoreContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
