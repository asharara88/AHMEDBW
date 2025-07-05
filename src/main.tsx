import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize React app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Log environment info in development
if (import.meta.env.DEV) {
  console.log('[Biowell] Application starting in development mode', {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  });
}

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log success
if (import.meta.env.DEV) {
  console.log('[Biowell] Application rendered successfully');
}
