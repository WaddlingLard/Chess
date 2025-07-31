import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChessApp from './ChessApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChessApp />
  </StrictMode>,
)
