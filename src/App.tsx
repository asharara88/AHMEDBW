import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MyCoachPage from './pages/coach/MyCoachPage';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PricingPage from './pages/PricingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ScrollToTop from './components/ScrollToTop';
import AboutPage from './pages/AboutPage';

// Lazy loaded components for better code splitting
const OnboardingPage = lazy(() => import('./pages/auth/OnboardingPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const StackPage = lazy(() => import('./pages/Stack'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ChatPage = lazy(() => import('./pages/chat/ChatPage'));
const QuickTipPage = lazy(() => import('./pages/chat/QuickTipPage'));
const SupplementsPage = lazy(() => import('./pages/supplements/SupplementsPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/checkout/CheckoutSuccessPage'));
const CheckoutCancelPage = lazy(() => import('./pages/checkout/CheckoutCancelPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const TestOpenAI = lazy(() => import('./pages/TestOpenAI'));
const ImportSupplementsPage = lazy(() => import('./pages/admin/ImportSupplementsPage'));
const RecipesPage = lazy(() => import('./pages/recipes/RecipesPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="stack" element={<StackPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="test-openai" element={<TestOpenAI />} />
          <Route path="admin/import-supplements" element={
            <ProtectedRoute>
              <ImportSupplementsPage />
            </ProtectedRoute>
          } />
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
          <Route path="chat/quick-tips" element={
            <ProtectedRoute>
              <QuickTipPage />
            </ProtectedRoute>
          } />
          <Route path="supplements" element={
            <ProtectedRoute>
              <SupplementsPage />
            </ProtectedRoute>
          } />
          <Route path="recipes" element={
            <ProtectedRoute>
              <RecipesPage />
            </ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="checkout/success" element={
            <ProtectedRoute>
              <CheckoutSuccessPage />
            </ProtectedRoute>
          } />
          <Route path="checkout/cancel" element={
            <ProtectedRoute>
              <CheckoutCancelPage />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;