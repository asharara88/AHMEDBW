import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, AlertCircle, Clock, CreditCard, Loader } from 'lucide-react';

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
      <div className={`flex items-center gap-2 rounded-lg bg-[hsl(var(--color-card))] p-3 ${className}`}>
        <Loader className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm">Loading subscription status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error ${className}`}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>Error loading subscription: {error}</span>
      </div>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning ${className}`}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>No active subscription. <a href="/pricing" className="underline">Subscribe now</a> to access premium features.</span>
      </div>
    );
  }

  if (subscription.subscription_status === 'active') {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success ${className}`}>
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
        <div>
          <span className="font-medium">Active Subscription</span>
          {subscription.current_period_end && (
            <span className="ml-2 text-xs">
              (Renews: {new Date(subscription.current_period_end * 1000).toLocaleDateString()})
            </span>
          )}
          {subscription.payment_method_last4 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-text-light">
              <CreditCard className="h-3 w-3" />
              {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (subscription.subscription_status === 'trialing') {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary ${className}`}>
        <Clock className="h-4 w-4 flex-shrink-0" />
        <div>
          <span className="font-medium">Trial Active</span>
          {subscription.current_period_end && (
            <span className="ml-2 text-xs">
              (Ends: {new Date(subscription.current_period_end * 1000).toLocaleDateString()})
            </span>
          )}
        </div>
      </div>
    );
  }

  if (['past_due', 'incomplete', 'unpaid'].includes(subscription.subscription_status)) {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error ${className}`}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>Payment issue with your subscription. Please update your payment method.</span>
      </div>
    );
  }

  if (subscription.subscription_status === 'canceled') {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-[hsl(var(--color-card-hover))] p-3 text-sm text-text-light ${className}`}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>Your subscription has been canceled. <a href="/pricing" className="text-primary underline">Resubscribe</a> to continue accessing premium features.</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 rounded-lg bg-[hsl(var(--color-card))] p-3 text-sm ${className}`}>
      <span>Subscription status: {subscription.subscription_status}</span>
    </div>
  );
};

export default SubscriptionStatus;