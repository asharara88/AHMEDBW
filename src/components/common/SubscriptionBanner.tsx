import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

// This component has been modified to remove Stripe integration
// It now serves as a placeholder for subscription status
const SubscriptionBanner = () => {
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