/*
  # Shopping Cart Table

  1. New Tables
    - cart_items: Records supplements a user has added to their shopping cart

  2. Indexes
    - Unique index on user_id and supplement_id to prevent duplicates

  3. Security
    - Row level security with policies so users manage only their own cart items
*/

-- Create cart_items table
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id uuid NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Unique index for quick lookups
CREATE UNIQUE INDEX cart_items_user_supplement_idx
  ON cart_items(user_id, supplement_id);

-- Enable Row Level Security
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow users to access their own cart items
CREATE POLICY cart_items_user_policy
  ON cart_items
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
