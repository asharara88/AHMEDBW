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
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user && !isDemo) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <SupabaseProvider>
      <ThemeProvider>
        <AuthProvider>
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
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="chat" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="supplements" element={
                <ProtectedRoute>
                  <SupplementsPage />
                </ProtectedRoute>
              } />
              <Route path="checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}

export default App;