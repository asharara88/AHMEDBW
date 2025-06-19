import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store';
import { supabase } from '../lib/supabaseClient';
import { logError, logInfo } from '../utils/logger';
import { restoreSession, refreshSessionIfNeeded } from '../lib/sessionManager';
import { useSession } from '@supabase/auth-helpers-react';

// Create context with the same shape as the auth store
const AuthContext = createContext<ReturnType<typeof useAuthStore.getState> | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authStore = useAuthStore();
  const session = useSession();
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have saved user data in localStorage
        const savedUserData = localStorage.getItem('biowell-user-data');
        if (savedUserData) {
          authStore.setLoading(true);
          const userData = JSON.parse(savedUserData);
          useAuthStore.setState({ profile: userData });
        }
        
        // Get the current session
        const currentSession = await restoreSession();
        
        useAuthStore.setState({ 
          session: currentSession,
          user: currentSession?.user ?? null,
          loading: false
        });
        
        // If session exists but is close to expiry, refresh it
        if (currentSession) {
          const expiresAt = currentSession.expires_at;
          const now = Math.floor(Date.now() / 1000);
          
          // If session expires in less than 5 minutes (300 seconds), refresh it
          if (expiresAt && expiresAt - now < 300) {
            await refreshSessionIfNeeded();
          }
        }
      } catch (err) {
        logError('Error initializing auth', err);
        authStore.setLoading(false);
      }
    };

    // Update store when session from auth-helpers changes
    if (session) {
      useAuthStore.setState({ 
        session,
        user: session.user,
        loading: false
      });
    }

    if (!authStore.isDemo) {
      initializeAuth();
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logInfo('Auth state changed', event);
        
        useAuthStore.setState({ 
          session,
          user: session?.user ?? null,
          loading: false
        });
        
        // If the event is SIGNED_OUT, clear the session and profile
        if (event === 'SIGNED_OUT') {
          logInfo('User signed out');
          useAuthStore.setState({ 
            user: null,
            session: null,
            profile: null
          });
          localStorage.removeItem('biowell-user-data');
        }
      }
    );

    // Set up a timer to periodically check and refresh the session if needed
    const refreshInterval = setInterval(async () => {
      if (!authStore.isDemo && authStore.session) {
        const expiresAt = authStore.session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        // If session expires in less than 5 minutes (300 seconds), refresh it
        if (expiresAt && expiresAt - now < 300) {
          logInfo('Session expiring soon, refreshing...');
          await authStore.refreshSession();
        }
      }
    }, 60000); // Check every minute

    // Cleanup
    return () => {
      if (!authStore.isDemo) {
        authListener.subscription.unsubscribe();
      }
      clearInterval(refreshInterval);
    };
  }, [authStore.isDemo, session]);

  return (
    <AuthContext.Provider value={authStore}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}