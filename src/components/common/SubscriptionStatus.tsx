import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubscriptionStatusProps {
  className?: string;
}

// This component has been modified to remove Stripe integration
// It now serves as a placeholder for subscription status
const SubscriptionStatus = ({ className = '' }: SubscriptionStatusProps) => {
  const [loading] = useState(false);
  const { user } = useAuth();

  if (loading) {
    return (
      <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Loader className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm">Loading subscription status...</span>
        </div>
      </div>
    );
  }

  // Default to showing no subscription
  return (
    <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-2 text-warning">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">No active subscription</span>
        </div>
        <p className="text-xs text-text-light">
          Upgrade to access premium features and personalized health recommendations.
        </p>
        <Link 
          to="/pricing" 
          className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark"
        >
          View Plans
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionStatus;