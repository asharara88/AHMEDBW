/*
  # Ensure Audio Cache Table and Policies

  1. New Tables
    - Creates audio_cache table if not already present
  2. Indexes
    - Adds indexes for efficient lookups
  3. Security
    - Enables RLS and policies for authenticated users (IF NOT EXISTS)
  4. Automation
    - Functions and trigger for cleaning up expired entries
*/

-- Create audio_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS audio_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key text NOT NULL,
  audio_data bytea NOT NULL,
  content_type text NOT NULL DEFAULT 'audio/mpeg',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Unique constraint for user_id and cache_key
CREATE UNIQUE INDEX IF NOT EXISTS audio_cache_user_id_cache_key_idx
  ON audio_cache (user_id, cache_key);

-- Index for expiry
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx
  ON audio_cache (expires_at);

-- Enable row level security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can read their own audio cache'
          AND tablename = 'audio_cache'
    ) THEN
        CREATE POLICY "Users can read their own audio cache"
            ON audio_cache
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can insert their own audio cache'
          AND tablename = 'audio_cache'
    ) THEN
        CREATE POLICY "Users can insert their own audio cache"
            ON audio_cache
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can update their own audio cache'
          AND tablename = 'audio_cache'
    ) THEN
        CREATE POLICY "Users can update their own audio cache"
            ON audio_cache
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can delete their own audio cache'
          AND tablename = 'audio_cache'
    ) THEN
        CREATE POLICY "Users can delete their own audio cache"
            ON audio_cache
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END$$;

-- Function to remove expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_audio_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM audio_cache
  WHERE expires_at < now();
END;
$$;

-- Trigger function wrapper
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_audio_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM cleanup_expired_audio_cache();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if present
DROP TRIGGER IF EXISTS cleanup_expired_audio_cache_trigger ON audio_cache;

-- Trigger to invoke cleanup
CREATE TRIGGER cleanup_expired_audio_cache_trigger
AFTER INSERT ON audio_cache
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_cleanup_expired_audio_cache();
