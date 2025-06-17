import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../lib/auth';
import { AlertCircle, Info } from 'lucide-react';
import { supabase, checkSupabaseConnection } from '../../lib/supabaseClient';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  const navigate = useNavigate();

  // Check Supabase connection when the component mounts
  useEffect(() => {
    const checkConnection = async () => {
      const { success } = await checkSupabaseConnection();
      setConnectionStatus(success ? 'connected' : 'error');
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (connectionStatus === 'error') {
      setError('Unable to connect to the authentication service. Please try again later.');
      return;
    }
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    navigate('/dashboard?demo=true');
  };

  return (
    <div className="w-full max-w-md">
      {connectionStatus === 'error' && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
          <Info className="h-5 w-5" />
          <span>
            Connection to authentication service is unavailable. You can still try the demo version.
          </span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        
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
        </div>
        
        <button
          type="submit"
          disabled={loading || connectionStatus === 'checking'}
          className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
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
        
        <div className="text-center">
          <button 
            type="button" 
            onClick={handleDemoLogin}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Skip sign in and try demo
          </button>
        </div>
      </form>
    </div>
  );
}