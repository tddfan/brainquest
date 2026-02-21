import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.onerror = function(message, source, lineno, colno, error) {
  console.error("GLOBAL ERROR CATCHER:", message, "at", source, lineno, colno);
  alert("ERROR: " + message + "\nCheck console for details.");
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
