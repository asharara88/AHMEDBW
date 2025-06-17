import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../lib/auth';
import { useError } from '../../contexts/ErrorContext';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import Logo from '../../components/common/Logo';
import { checkSupabaseConnection } from '../../lib/supabaseClient';
import { AlertCircle, Info } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  
  const { addError } = useError();
  const { user, startDemo, checkOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if there's a demo flag in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === 'true') {
      startDemo();
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, startDemo, navigate]);
  
  // Check Supabase connection when component mounts
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const { success, error } = await checkSupabaseConnection();
        setConnectionStatus(success ? 'connected' : 'error');
        
        if (!success) {
          console.error('Error connecting to Supabase:', error);
          setError('Connection to authentication service is unavailable. You can still try the demo version.');
        }
      } catch (e) {
        console.error('Exception checking Supabase connection:', e);
        setConnectionStatus('error');
        setError('Connection to authentication service is unavailable. You can still try the demo version.');
      }
    };
    
    verifyConnection();
  }, []);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        // Try to load user data from localStorage first
        const savedUserData = localStorage.getItem('biowell-user-data');
        let onboardingCompleted = false;
        
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          onboardingCompleted = !!(userData.firstName && userData.lastName);
        } else {
          // If not in localStorage, check database
          onboardingCompleted = await checkOnboardingStatus();
        }
        
        if (!onboardingCompleted) {
          navigate('/onboarding');
          return;
        }
        
        // Get redirect URL from query parameters or session storage
        const params = new URLSearchParams(location.search);
        const redirectParam = params.get('redirectUrl');
        const redirectUrl = redirectParam || sessionStorage.getItem('redirectUrl') || '/dashboard';
        
        navigate(redirectUrl, { replace: true });
      }
    };
    
    checkUserStatus();
  }, [user, navigate, checkOnboardingStatus, location.search]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (connectionStatus === 'error') {
      setError('Unable to connect to the authentication service. Please try again later or use the demo.');
      return;
    }
    
    if (!email || !password) {
      addError({
        message: 'Email and password are required',
        severity: 'warning',
        source: 'login-form'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.error) {
        addError({
          ...result.error,
          source: 'login'
        });
        setError(result.error.message || 'Authentication failed');
        return;
      }
      
      // Check if user has completed onboarding
      const savedUserData = localStorage.getItem('biowell-user-data');
      let onboardingCompleted = false;
      
      if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        onboardingCompleted = !!(userData.firstName && userData.lastName);
      } else {
        onboardingCompleted = await checkOnboardingStatus();
      }
      
      if (!onboardingCompleted) {
        navigate('/onboarding');
        return;
      }
      
      // Get redirect URL from query parameters or session storage
      const params = new URLSearchParams(location.search);
      const redirectParam = params.get('redirectUrl');
      const redirectUrl = redirectParam || sessionStorage.getItem('redirectUrl') || '/dashboard';
      
      // Clear stored redirect URL
      sessionStorage.removeItem('redirectUrl');
      
      navigate(redirectUrl);
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again or use the demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = () => {
    startDemo();
    navigate('/dashboard');
  };
  
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background-alt px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-[hsl(var(--color-card))] p-8 shadow-lg dark:shadow-black/20">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <Logo className="h-8" />
            </div>
            <h1 className="text-2xl font-bold text-text">Welcome back</h1>
            <p className="mt-2 text-base text-text-light">
              Sign in to your account to continue
            </p>
          </div>
          
          {connectionStatus === 'error' && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
              <Info className="h-5 w-5" />
              <span>
                Connection to authentication service is unavailable. You can still try the demo version.
              </span>
            </div>
          )}
          
          <ErrorDisplay />
          
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} aria-label="Sign in form" className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-base font-medium text-text-light mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-3 text-base text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                aria-required="true"
                autoComplete="email"
              />
            </div>
            
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="password" className="block text-base font-medium text-text-light">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded"
                  aria-label="Forgot your password? Reset it here"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-3 text-base text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                aria-required="true"
                autoComplete="current-password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-3 text-base font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              disabled={loading || connectionStatus === 'checking'}
              aria-busy={loading}
              aria-disabled={loading || connectionStatus === 'checking'}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true"></span>
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={handleDemoClick}
              className="text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Skip sign in and try demo version"
            >
              Skip sign in and try demo
            </button>
          </div>
          
          <div className="mt-6 text-center text-base text-text-light">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="font-medium text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded"
              aria-label="Sign up for a new account"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;