/*
  # Fix audio_cache table and policies

  1. New Tables
    - Ensures audio_cache table exists (if not already created)
  2. Indexes
    - Creates indexes for efficient querying
  3. Security
    - Enables RLS on audio_cache table
    - Creates policies for authenticated users (with IF NOT EXISTS)
  4. Functions
    - Creates functions for automatic cleanup of expired cache entries
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

-- Create unique index on user_id and cache_key
CREATE UNIQUE INDEX IF NOT EXISTS audio_cache_user_id_cache_key_idx ON audio_cache (user_id, cache_key);

-- Create index on expires_at for cleanup operations
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx ON audio_cache (expires_at);

-- Enable Row Level Security
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

-- Create function to clean up expired cache entries
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

-- Create a trigger to automatically clean up expired entries
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

-- Drop the trigger if it exists to avoid errors when recreating
DROP TRIGGER IF EXISTS cleanup_expired_audio_cache_trigger ON audio_cache;

-- Create a trigger that runs the cleanup function periodically
CREATE TRIGGER cleanup_expired_audio_cache_trigger
AFTER INSERT ON audio_cache
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_cleanup_expired_audio_cache();
