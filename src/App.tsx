import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Eagerly loaded components
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ErrorPage from './pages/ErrorPage';
import AccessibilityMenu from './components/common/AccessibilityMenu';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazily loaded page components
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const OnboardingPage = lazy(() => import('./pages/auth/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ChatPage = lazy(() => import('./pages/chat/ChatPage'));
const SupplementsPage = lazy(() => import('./pages/supplements/SupplementsPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));

// Suspense fallback component
const PageLoadingFallback = () => (
  <div className="flex h-[50vh] items-center justify-center" role="status" aria-live="polite">
    <LoadingSpinner />
    <span className="sr-only">Loading page...</span>
  </div>
);

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
    return <PageLoadingFallback />;
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
          <Route index element={
            <Suspense fallback={<PageLoadingFallback />}>
              <HomePage />
            </Suspense>
          } />
          
          <Route path="login" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <LoginPage />
            </Suspense>
          } />
          
          <Route path="signup" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <SignupPage />
            </Suspense>
          } />
          
          <Route path="onboarding" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <OnboardingPage />
            </Suspense>
          } />
          
          <Route path="pricing" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <PricingPage />
            </Suspense>
          } />
          
          <Route path="how-it-works" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <HowItWorksPage />
            </Suspense>
          } />
          
          <Route path="dashboard" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <DashboardPage />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="chat" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <ChatPage />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="supplements" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <SupplementsPage />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="checkout" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <CheckoutPage />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="profile" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <ProfilePage />
                </Suspense>
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