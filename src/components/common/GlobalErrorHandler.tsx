import { useEffect } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { ErrorCode } from '../../utils/errorHandling';
import { useNavigate } from 'react-router-dom';
import ErrorDisplay from './ErrorDisplay';

/**
 * Component to display global errors and handle special error cases
 * This will intercept specific errors (like auth errors) and handle them appropriately
 */
const GlobalErrorHandler = () => {
  const { errors, removeError } = useError();
  const navigate = useNavigate();
  
  // Show global error toast/banner for fatal errors
  const fatalErrors = errors.filter(error => error.severity === 'fatal');
  
  // Handle auth-related errors that require redirection
  useEffect(() => {
    const authErrors = errors.filter(
      error => error.source === 'auth' && 
      (error.code === ErrorCode.AUTH_EXPIRED_SESSION || 
       error.code === ErrorCode.AUTH_UNAUTHORIZED)
    );
    
    if (authErrors.length > 0) {
      // Remove the error
      authErrors.forEach(error => removeError(error.id));
      
      // Navigate to login page
      const redirectUrl = window.location.pathname;
      navigate(`/login?redirectUrl=${encodeURIComponent(redirectUrl)}`, { replace: true });
    }
  }, [errors, removeError, navigate]);

  // Network error handler
  useEffect(() => {
    const networkErrors = errors.filter(
      error => error.code === ErrorCode.NETWORK_ERROR ||
               error.code === ErrorCode.API_TIMEOUT
    );
    
    if (networkErrors.length > 0) {
      // We could implement retries or other handling here
      console.log('Network errors detected:', networkErrors);
      
      // For now, we'll just keep the errors displayed
    }
  }, [errors]);

  if (fatalErrors.length === 0) {
    return null; // No fatal errors to display
  }

  // Display a banner for fatal errors
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
      <ErrorDisplay 
        variant="toast"
        className="max-w-md shadow-lg"
      />
    </div>
  );
};

export default GlobalErrorHandler;