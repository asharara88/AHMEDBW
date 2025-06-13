// This file previously contained Stripe product configurations
// It has been emptied as part of removing Stripe integration

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

// Placeholder for product configurations that can be used with alternative payment methods
export const products: Record<string, Product> = {
  subscription: {
    id: 'subscription',
    name: 'Biowell Subscription',
    description: 'Subscribe to Biowell for personalized health coaching and supplement recommendations',
    price: 199
  }
};