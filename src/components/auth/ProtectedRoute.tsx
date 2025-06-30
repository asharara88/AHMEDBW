import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isDemo } = useAuthStore();
  const location = useLocation();
  
  useEffect(() => {
    if (!user && !loading && !isDemo) {
      sessionStorage.setItem('redirectUrl', location.pathname);
    }
  }, [user, loading, isDemo, location]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" aria-live="polite" aria-busy="true">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent"></div>
          <p className="text-text-light">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user && !isDemo) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;