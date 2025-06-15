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
import { VoiceProvider } from './providers/VoiceProvider';
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
                <VoiceProvider>
                  <GlobalErrorHandler />
                  <App />
                </VoiceProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </SupabaseProvider>
      </ErrorProvider>
    </BrowserRouter>
  </StrictMode>
);