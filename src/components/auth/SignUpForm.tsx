import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../../lib/auth';
import { AlertCircle } from 'lucide-react';

interface SignUpFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  onSignUp?: (email: string, password: string) => Promise<{ success: boolean; data?: any }>;
}

export default function SignUpForm({ onSuccess, redirectTo = '/dashboard', onSignUp }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (onSignUp) {
        // Use the provided sign up function
        const result = await onSignUp(email, password);
        
        if (!result.success) {
          // Error is handled by the parent component
          setLoading(false);
          return;
        }
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectTo);
        }
      } else {
        // Use the default sign up function
        const { data, error: signUpError } = await signUp(email, password);
        
        if (signUpError) {
          throw signUpError;
        }
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectTo);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign up';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
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
  );
}