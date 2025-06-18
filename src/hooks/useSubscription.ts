import { useState, useEffect } from 'react';
import { stripeApi } from '../api/stripeApi';
import { useAuthStore } from '../store';
import { logError } from '../utils/logger';

export interface SubscriptionData {
  id: string | null;
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid' | 'inactive';
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Hook for managing user subscription data
 */
export function useSubscription() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchSubscription = async () => {
    if (!user) {
      setSubscriptionData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await stripeApi.getSubscription();
      
      if (data) {
        setSubscriptionData({
          id: data.subscription_id,
          status: data.status || 'inactive',
          currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end * 1000) : null,
          cancelAtPeriodEnd: data.cancel_at_period_end || false
        });
      } else {
        setSubscriptionData(null);
      }
    } catch (err) {
      logError('Error fetching subscription data', err);
      setError('Failed to load subscription information');
      setSubscriptionData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const redirectToCustomerPortal = async (returnUrl?: string) => {
    try {
      const { url } = await stripeApi.createPortalSession(returnUrl);
      window.location.href = url;
      return true;
    } catch (err) {
      logError('Error redirecting to customer portal', err);
      setError('Failed to open subscription management portal');
      return false;
    }
  };

  const isActive = !!subscriptionData && 
    (subscriptionData.status === 'active' || subscriptionData.status === 'trialing');

  return {
    subscription: subscriptionData,
    isActive,
    loading,
    error,
    refresh: fetchSubscription,
    redirectToCustomerPortal
  };
}