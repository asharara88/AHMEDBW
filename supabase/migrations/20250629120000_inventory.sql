/*
  # Inventory Tracking for Supplements

  1. Changes
    - Add stock and availability columns to `supplements`
      - `stock_quantity` integer
      - `is_available` boolean
      - `is_featured` boolean
      - `is_bestseller` boolean
*/

ALTER TABLE supplements
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN NOT NULL DEFAULT FALSE;
