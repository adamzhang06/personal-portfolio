import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/site.css'
import App from './App.jsx'
import { installHoverTrace } from './lib/hoverTrace'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

installHoverTrace()
