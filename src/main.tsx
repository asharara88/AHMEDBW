import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './providers/CartProvider';
import { ErrorProvider } from './contexts/ErrorContext';
import GlobalErrorHandler from './components/common/GlobalErrorHandler';
import '@fontsource-variable/inter';

// Initialize performance monitoring
if (process.env.NODE_ENV !== 'production') {
  // Only log performance metrics in development
  const reportWebVitals = async () => {
    const { onCLS, onFID, onLCP, onTTFB } = await import('web-vitals');
    onCLS(console.log);
    onFID(console.log);
    onLCP(console.log);
    onTTFB(console.log);
  };
  
  reportWebVitals();
}

// Check Supabase connection on startup
import { checkSupabaseConnection } from './lib/supabaseClient';
checkSupabaseConnection()
  .then(({success}) => {
    console.log('Supabase connection check:', success ? 'Success' : 'Failed');
    
    // If connection fails, still proceed with app initialization
    // The app will handle connection failures gracefully
    if (!success) {
      console.warn('Supabase connection failed - proceeding with limited functionality');
    }
  })
  .catch(err => {
    console.error('Error checking Supabase connection:', err);
  });

// Initialize variables for accessibility monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Log accessibility issues in development
    if (process.env.NODE_ENV === 'development') {
      // This would be where you'd initialize accessibility testing tools
      console.log('Accessibility monitoring enabled in development mode');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorProvider>
        <SupabaseProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <GlobalErrorHandler />
                <App />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </SupabaseProvider>
      </ErrorProvider>
    </BrowserRouter>
  </StrictMode>
);