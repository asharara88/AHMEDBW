import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateSession } from '../utils/authHelpers';
import { logError } from '../utils/logger';

/**
 * Hook to guard routes that require authentication
 * @param {string} redirectTo Path to redirect to if not authenticated
 */
export function useAuthGuard(redirectTo: string = '/login') {
  const { user, loading, isDemo, refreshSession } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      // Skip checks if in demo mode or still loading
      if (isDemo || loading) return;
      
      // If no user, redirect to login
      if (!user) {
        navigate(redirectTo, { replace: true });
        return;
      }
      
      // Validate the session
      const isValid = await validateSession();
      if (!isValid) {
        try {
          // Try to refresh the session
          await refreshSession();
        } catch (error) {
          logError('Session refresh failed', error);
          navigate(redirectTo, { replace: true });
        }
      }
    };
    
    checkAuth();
  }, [user, loading, isDemo, navigate, redirectTo, refreshSession]);
  
  return { isAuthenticated: !!user && !loading, isLoading: loading };
}