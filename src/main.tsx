import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './providers/CartProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SupabaseProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </SupabaseProvider>
    </BrowserRouter>
  </StrictMode>
);