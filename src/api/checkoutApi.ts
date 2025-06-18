import { apiClient } from './apiClient';
import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';

export const checkoutApi = {
  /**
   * Create a checkout session for a product
   * @param priceId The Stripe price ID
   * @param successUrl URL to redirect on success
   * @param cancelUrl URL to redirect on cancel
   */
  async createCheckoutSession(
    priceId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<{ sessionId: string; url: string }> {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw {
          type: 'authentication',
          message: 'Authentication required',
        };
      }
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !anonKey) {
        throw {
          type: 'server',
          message: 'Missing API configuration',
        };
      }
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': anonKey
          },
          body: JSON.stringify({
            priceId,
            successUrl,
            cancelUrl
          }),
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw {
          type: 'server',
          message: errorData.error || 'Failed to create checkout session',
          status: response.status
        };
      }
      
      return await response.json();
    } catch (error) {
      logError('Error creating checkout session', error);
      throw error;
    }
  },
  
  /**
   * Create a customer portal session
   * @param returnUrl URL to return to after portal session
   */
  async createPortalSession(returnUrl?: string): Promise<{ url: string }> {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw {
          type: 'authentication',
          message: 'Authentication required',
        };
      }
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !anonKey) {
        throw {
          type: 'server',
          message: 'Missing API configuration',
        };
      }
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': anonKey
          },
          body: JSON.stringify({
            returnUrl
          }),
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw {
          type: 'server',
          message: errorData.error || 'Failed to create portal session',
          status: response.status
        };
      }
      
      return await response.json();
    } catch (error) {
      logError('Error creating portal session', error);
      throw error;
    }
  },
  
  /**
   * Check payment status from success page
   * @param sessionId The Stripe checkout session ID
   */
  async checkPaymentStatus(sessionId: string): Promise<{ status: string; subscription_id?: string }> {
    return apiClient.callFunction('check-payment-status', { sessionId });
  }
};