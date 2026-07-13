import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import HouseholdGate from './components/HouseholdGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <HouseholdGate>
        <App />
      </HouseholdGate>
    </BrowserRouter>
  </StrictMode>,
)
