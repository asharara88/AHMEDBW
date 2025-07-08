export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number; // 1-5
  title?: string;
  content: string;
  verified_purchase: boolean;
  helpful_votes?: number;
  created_at: Date;
  updated_at: Date;
  images?: string[]; // URLs to review images
}