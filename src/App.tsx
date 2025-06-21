import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import QuizPage from './pages/QuizPage';
import StackPage from './pages/Stack';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/dashboard/DashboardPage';
import CodexDashboard from './pages/dashboard/CodexDashboard';
import ChatPage from './pages/chat/ChatPage';
import QuickTipPage from './pages/chat/QuickTipPage';
import SupplementsPage from './pages/supplements/SupplementsPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import CheckoutSuccessPage from './pages/checkout/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/checkout/CheckoutCancelPage';
import ProfilePage from './pages/profile/ProfilePage';
import PricingPage from './pages/PricingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import TestOpenAI from './pages/TestOpenAI';

function App() {
  return (
    <Layout>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="stack" element={<StackPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="test-openai" element={<TestOpenAI />} />
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="codex" element={
          <ProtectedRoute>
            <CodexDashboard />
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
    </Layout>
  );
}

export default App;