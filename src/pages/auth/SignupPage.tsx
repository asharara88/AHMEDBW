import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signUp } from '../../lib/auth';
import { useError } from '../../contexts/ErrorContext';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import Logo from '../../components/common/Logo';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { addError } = useError();
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!email) {
      addError({
        message: 'Email is required',
        severity: 'warning',
        source: 'signup-form'
      });
      return;
    }
    
    if (!password) {
      addError({
        message: 'Password is required',
        severity: 'warning',
        source: 'signup-form'
      });
      return;
    }
    
    if (password !== confirmPassword) {
      addError({
        message: 'Passwords do not match',
        severity: 'warning',
        source: 'signup-form'
      });
      return;
    }
    
    if (password.length < 8) {
      addError({
        message: 'Password must be at least 8 characters',
        severity: 'warning',
        source: 'signup-form'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await signUp(email, password);
      
      if (result.error) {
        addError({
          ...result.error,
          source: 'signup'
        });
        return;
      }
      
      // Navigate to onboarding
      navigate('/onboarding');
    } catch (err) {
      console.error('Error during signup:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ErrorBoundary>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background-alt px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <Logo className="h-8" />
            </div>
            <h1 className="text-2xl font-bold text-text">Create your account</h1>
            <p className="mt-2 text-text-light">
              Start your health optimization journey today
            </p>
          </div>
          
          <ErrorDisplay />
          
          <div className="rounded-xl bg-[hsl(var(--color-card))] p-8 shadow-lg dark:shadow-lg dark:shadow-black/10">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-light mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-light mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
                <p className="mt-1 text-xs text-text-light">
                  Must be at least 8 characters
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-light mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Creating account...
                  </span>
                ) : (
                  'Sign up'
                )}
              </button>
            </form>
          </div>
          
          <div className="mt-6 text-center text-sm text-text-light">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SignupPage;