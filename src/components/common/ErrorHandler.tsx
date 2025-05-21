import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, ErrorType } from '../../api/apiClient';
import { useAuthStore } from '../../store';
import { logError } from '../../utils/logger';

/**
 * Global error handler component that handles API errors
 * This should be mounted at the app level
 */
const ErrorHandler = () => {
  const { refreshSession } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Create a global error handler for unhandled promise rejections
    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      // Check if it's an API error
      if (error && typeof error === 'object' && 'type' in error) {
        const apiError = error as ApiError;
        
        // Handle authentication errors
        if (apiError.type === ErrorType.AUTHENTICATION) {
          logError('Authentication error detected', apiError);
          
          // Try to refresh the session
          try {
            await refreshSession();
          } catch (refreshError) {
            // If refresh fails, redirect to login
            logError('Session refresh failed', refreshError);
            
            // Save the current URL to redirect back after login
            if (window.location.pathname !== '/login') {
              sessionStorage.setItem('redirectUrl', window.location.pathname);
            }
            
            navigate('/login', { replace: true });
          }
        }
        
        // Handle network errors
        if (apiError.type === ErrorType.NETWORK) {
          // Could show a toast notification here
          logError('Network error detected', apiError);
        }
        
        // Handle server errors
        if (apiError.type === ErrorType.SERVER) {
          // Could show a toast notification here
          logError('Server error detected', apiError);
        }
      }
    };

    // Add event listener
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [refreshSession, navigate]);

  // This component doesn't render anything
  return null;
};

export default ErrorHandler;