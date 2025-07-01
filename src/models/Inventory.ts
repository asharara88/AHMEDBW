export interface Inventory {
  product_id: string;
  quantity: number;
  location: string;
  reorder_point: number;
  last_restock_date: Date;
  next_restock_date?: Date;
  created_at: Date;
  updated_at: Date;
}