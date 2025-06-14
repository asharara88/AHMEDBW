import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ChatPage from './pages/chat/ChatPage';
import SupplementsPage from './pages/supplements/SupplementsPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import ProfilePage from './pages/profile/ProfilePage';
import PricingPage from './pages/PricingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import ErrorPage from './pages/ErrorPage';
import AccessibilityMenu from './components/common/AccessibilityMenu';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isDemo } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (!user && !loading && !isDemo) {
      sessionStorage.setItem('redirectUrl', location.pathname);
    }
  }, [user, loading, isDemo, location]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Loading your account information</span>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user && !isDemo) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <AccessibilityMenu />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="chat" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <ChatPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="supplements" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <SupplementsPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <CheckoutPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <ProfilePage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="error" element={<ErrorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;