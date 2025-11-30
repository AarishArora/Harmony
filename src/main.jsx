import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Configure axios to send token in Authorization header
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

// Update Authorization header whenever token changes
window.addEventListener('tokenUpdated', (event) => {
  const newToken = event.detail?.token || localStorage.getItem('token');
  if (newToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
