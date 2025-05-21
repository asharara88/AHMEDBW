export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: Record<string, StripeProduct> = {
  subscription: {
    priceId: 'price_1RR5Q2C7KFs4iH9MPadqbiDw',
    name: 'Biowell Subscription',
    description: 'Subscribe to Biowell for personalized health coaching and supplement recommendations',
    mode: 'subscription'
  }
};