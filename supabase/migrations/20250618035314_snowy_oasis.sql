/*
  # Stripe Integration Tables

  1. New Tables
    - `stripe_products` - Products available in Stripe
    - `stripe_prices` - Pricing information for products
    - `stripe_webhooks` - Log of Stripe webhook events
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for user access
    - Ensure service role access for Stripe webhooks
  3. Changes
    - Add foreign key relationships between tables
*/

-- Create stripe_products table
CREATE TABLE IF NOT EXISTS stripe_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stripe_prices table
CREATE TABLE IF NOT EXISTS stripe_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_id text UNIQUE NOT NULL,
  product_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('one_time', 'recurring')),
  active boolean DEFAULT true,
  currency text NOT NULL,
  unit_amount integer NOT NULL,
  interval_count integer,
  interval text CHECK (interval IN ('day', 'week', 'month', 'year')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (product_id) REFERENCES stripe_products(product_id) ON DELETE CASCADE
);

-- Create stripe_webhooks table
CREATE TABLE IF NOT EXISTS stripe_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id text,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster webhook processing
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_processed ON stripe_webhooks(processed, created_at);

-- Create index for lookup by product
CREATE INDEX IF NOT EXISTS idx_stripe_prices_product_id ON stripe_prices(product_id);

-- Enable Row Level Security
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- Create policies for stripe_products
CREATE POLICY "Allow public read access for active products" ON stripe_products
  FOR SELECT
  USING (active = true);

-- Create policies for stripe_prices
CREATE POLICY "Allow public read access for active prices" ON stripe_prices
  FOR SELECT
  USING (active = true);

-- Create policies for stripe_webhooks (admin only)
CREATE POLICY "Only service_role can access webhooks" ON stripe_webhooks
  FOR ALL
  TO service_role
  USING (true);

-- Add trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stripe_products_updated_at
  BEFORE UPDATE ON stripe_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_prices_updated_at
  BEFORE UPDATE ON stripe_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();