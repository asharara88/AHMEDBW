import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SupabaseProvider } from '../../contexts/SupabaseContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { CartProvider } from '../shopping/CartProvider';
import ErrorHandler from '../common/ErrorHandler';
import AuthErrorHandler from '../auth/AuthErrorHandler';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabaseClient';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wraps the application with all required providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <SessionContextProvider supabaseClient={supabase}>
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
      </SessionContextProvider>
    </BrowserRouter>
  );
}