import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { stripeApi } from '../../api/stripeApi';
import { useAuthStore } from '../../store';
import { formatDate } from '../../utils/dateFormat';

interface SubscriptionCardProps {
  className?: string;
}

const SubscriptionCard = ({ className = '' }: SubscriptionCardProps) => {
  const [subscription, setSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await stripeApi.getSubscription();
        setSubscription(data);
      } catch (err) {
        console.error('Error loading subscription:', err);
        setError('Failed to load subscription status');
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      default:
        return 'Inactive';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'text-success';
      case 'past_due':
        return 'text-warning';
      case 'canceled':
        return 'text-error';
      default:
        return 'text-text-light';
    }
  };

  const handleManageClick = async () => {
    try {
      setLoading(true);
      const { url } = await stripeApi.createPortalSession();
      window.location.href = url;
    } catch (err) {
      console.error('Error creating portal session:', err);
      setError('Failed to open customer portal');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-sm">Loading subscription status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
        <div className="flex items-center gap-2 text-error">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // If no subscription, show upgrade banner
  if (!subscription) {
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
  }

  // Show active subscription
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium">Subscription</h3>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(subscription.status)}`}>
          {getStatusLabel(subscription.status)}
        </span>
      </div>

      <div className="mb-3 space-y-2 text-sm">
        {subscription.price_id && (
          <div className="flex justify-between">
            <span className="text-text-light">Plan:</span>
            <span className="font-medium">Premium</span>
          </div>
        )}
        
        {subscription.current_period_end && (
          <div className="flex items-center justify-between">
            <span className="text-text-light">Renews:</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(new Date(subscription.current_period_end * 1000))}
            </span>
          </div>
        )}

        {subscription.cancel_at_period_end && (
          <div className="mt-2 rounded-lg bg-warning/10 p-2 text-xs text-warning">
            Your subscription will end on {formatDate(new Date(subscription.current_period_end * 1000))}
          </div>
        )}
      </div>

      <button
        onClick={handleManageClick}
        className="flex w-full items-center justify-center gap-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-xs font-medium text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
      >
        Manage Subscription
        <ChevronRight className="h-3 w-3" />
      </button>
    </motion.div>
  );
};

export default SubscriptionCard;