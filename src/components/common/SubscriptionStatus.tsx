import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, AlertCircle, Clock, CreditCard, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubscriptionStatusProps {
  className?: string;
}

const SubscriptionStatus = ({ className = '' }: SubscriptionStatusProps) => {
  const [subscription, setSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();
        
        if (fetchError) {
          throw fetchError;
        }
        
        setSubscription(data);
      } catch (err: any) {
        console.error('Error fetching subscription:', err);
        setError(err.message || 'Failed to fetch subscription status');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [user, supabase]);

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

  if (error) {
    return (
      <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
        <div className="flex items-center gap-2 text-error">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">Error loading subscription</span>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
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

  if (subscription.subscription_status === 'active') {
    return (
      <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Active Subscription</span>
          </div>
          
          {subscription.current_period_end && (
            <p className="text-xs text-text-light">
              Your subscription renews on {new Date(subscription.current_period_end * 1000).toLocaleDateString()}.
            </p>
          )}
          
          {subscription.payment_method_last4 && (
            <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-2 text-xs text-text-light">
              <CreditCard className="h-3 w-3" />
              Payment method: {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (subscription.subscription_status === 'trialing') {
    return (
      <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Trial Active</span>
          </div>
          
          {subscription.current_period_end && (
            <p className="text-xs text-text-light">
              Your trial ends on {new Date(subscription.current_period_end * 1000).toLocaleDateString()}.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (['past_due', 'incomplete', 'unpaid'].includes(subscription.subscription_status)) {
    return (
      <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2 text-error">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Payment Issue</span>
          </div>
          
          <p className="text-xs text-text-light">
            There's an issue with your payment method. Please update your payment details to continue your subscription.
          </p>
          
          <button className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark">
            Update Payment Method
          </button>
        </div>
      </div>
    );
  }

  if (subscription.subscription_status === 'canceled') {
    return (
      <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2 text-text-light">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Subscription Canceled</span>
          </div>
          
          <p className="text-xs text-text-light">
            Your subscription has been canceled. Resubscribe to continue accessing premium features.
          </p>
          
          <Link 
            to="/pricing" 
            className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark"
          >
            Resubscribe
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">Subscription status: {subscription.subscription_status}</span>
      </div>
    </div>
  );
};

export default SubscriptionStatus;