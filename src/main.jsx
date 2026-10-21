import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// CSS global antes do App: os .css dos componentes precisam vir depois para vencer
// as regras globais de mesma especificidade (no Vue o `scoped` garantia isso).
import './assets/styles/index.css'
import App from './App'

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
