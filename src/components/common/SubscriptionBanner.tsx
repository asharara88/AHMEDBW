import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

// This component has been modified to remove Stripe integration
// It now serves as a placeholder for subscription status
const SubscriptionBanner = () => {
  const [subscription] = useState<any | null>(null);
  const { user } = useAuth();

  // If user has a subscription, don't show the banner
  if (subscription) {
    return null;
  }

  return (
    <div className="rounded-lg bg-primary/10 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-primary" />
          <span className="text-sm text-primary">Upgrade to access premium features</span>
        </div>
        <Link 
          to="/pricing" 
          className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-dark"
        >
          View Plans
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionBanner;