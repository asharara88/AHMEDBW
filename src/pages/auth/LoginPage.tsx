import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { useAuthStore } from '../../store';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, startDemo, user, checkOnboardingStatus } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
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
        
        const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
        navigate(redirectUrl, { replace: true });
      }
    };
    
    checkUserStatus();
  }, [user, navigate, checkOnboardingStatus]);
  
  // Check for auth error in URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authError = params.get('error');
    if (authError) {
      setError(decodeURIComponent(authError));
    }
  }, [location]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('Incorrect email or password. Please try again.');
          return;
        }
        throw new Error(signInError.message);
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
      
      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
      sessionStorage.removeItem('redirectUrl');
      navigate(redirectUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
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
            <p className="mt-2 text-text-light">
              Sign in to your account to continue
            </p>
          </div>
          
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="input w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className="mb-6">
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-dark">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                className="input w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={handleDemoClick}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Skip sign in and try demo
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-text-light">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;