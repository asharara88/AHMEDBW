import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle, Clock, CreditCard, Loader } from 'lucide-react';

const SubscriptionBanner = () => {
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
      <div className="flex items-center justify-center rounded-lg bg-[hsl(var(--color-card))] p-3">
        <Loader className="mr-2 h-4 w-4 animate-spin text-primary" />
        <span className="text-sm">Loading subscription status...</span>
      </div>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
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
  }

  return null; // Don't show anything for active subscriptions
};

export default SubscriptionBanner;