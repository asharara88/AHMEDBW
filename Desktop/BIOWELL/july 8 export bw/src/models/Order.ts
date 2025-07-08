export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  payment_details: PaymentDetails;
  shipping_info: ShippingInfo;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface PaymentDetails {
  payment_method: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  last_four?: string; // Last 4 digits of credit card
  card_type?: string;
}

export interface ShippingInfo {
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  shipping_method: string;
  tracking_number?: string;
  estimated_delivery?: Date;
  carrier?: string;
}