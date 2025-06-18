import { apiClient } from './apiClient';
import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';

export interface Product {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: Record<string, any>;
}

export interface Price {
  id: string;
  product_id: string;
  type: 'one_time' | 'recurring';
  active: boolean;
  currency: string;
  unit_amount: number;
  interval?: string;
  interval_count?: number;
}

interface CheckoutOptions {
  successUrl?: string;
  cancelUrl?: string;
}

export const stripeApi = {
  /**
   * Get all active products
   */
  async getProducts(): Promise<Product[]> {
    return apiClient.request(
      () => supabase
        .from('stripe_products')
        .select('*')
        .eq('active', true),
      'Failed to fetch products'
    );
  },

  /**
   * Get active prices for a product
   */
  async getPrices(productId: string): Promise<Price[]> {
    return apiClient.request(
      () => supabase
        .from('stripe_prices')
        .select('*')
        .eq('product_id', productId)
        .eq('active', true),
      'Failed to fetch prices'
    );
  },

  /**
   * Create a checkout session for the specified product
   */
  async createCheckoutSession(
    priceId: string, 
    options: CheckoutOptions = {}
  ): Promise<{ sessionId: string; url: string }> {
    return apiClient.callFunction('create-checkout', {
      priceId,
      successUrl: options.successUrl || `${window.location.origin}/checkout/success`,
      cancelUrl: options.cancelUrl || `${window.location.origin}/checkout/cancel`
    });
  },

  /**
   * Get customer subscription information
   */
  async getSubscription(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('stripe_subscriptions')
        .select(`
          subscription_id,
          status,
          price_id,
          current_period_start,
          current_period_end,
          cancel_at_period_end
        `)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (err) {
      logError('Error fetching subscription', err);
      return null;
    }
  },

  /**
   * Create a customer portal session
   */
  async createPortalSession(returnUrl?: string): Promise<{ url: string }> {
    return apiClient.callFunction('create-portal-session', {
      returnUrl: returnUrl || `${window.location.origin}/profile`
    });
  },

  /**
   * Check if a user has an active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getSubscription();
      return subscription?.status === 'active' || subscription?.status === 'trialing';
    } catch (err) {
      logError('Error checking subscription status', err);
      return false;
    }
  }
};