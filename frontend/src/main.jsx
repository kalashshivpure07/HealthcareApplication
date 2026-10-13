import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            borderRadius: '10px',
            padding: '12px 16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
          },
          success: {
            style: { background: '#16a34a', color: 'white' },
            iconTheme: { primary: 'white', secondary: '#16a34a' },
          },
          error: {
            style: { background: '#ef4444', color: 'white' },
            iconTheme: { primary: 'white', secondary: '#ef4444' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
