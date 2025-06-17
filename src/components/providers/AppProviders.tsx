import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SupabaseProvider } from '../../contexts/SupabaseContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { CartProvider } from '../../components/shopping/CartProvider';
import ErrorHandler from '../../components/common/ErrorHandler';
import AuthErrorHandler from '../../components/auth/AuthErrorHandler';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wraps the application with all required providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <SupabaseProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ErrorHandler />
              <AuthErrorHandler />
              {children}
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </SupabaseProvider>
    </BrowserRouter>
  );
}