/*
  # Audio Cache System

  1. New Tables
    - `audio_cache`: Stores cached audio data for text-to-speech responses with automatic expiration
  
  2. Indexes & Performance
    - Index on `expires_at` for efficient cleanup operations
    - Unique index on `(user_id, cache_key)` for fast lookups
  
  3. Security
    - Row Level Security enabled with user-specific policies
  
  4. Automation
    - Trigger for automatic cleanup of expired cache entries
    - Maintenance function for scheduled cleanup
*/

-- Create audio_cache table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS audio_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key text NOT NULL,
  audio_data bytea NOT NULL,
  content_type text NOT NULL DEFAULT 'audio/mpeg',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx ON audio_cache(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS audio_cache_user_id_cache_key_idx ON audio_cache(user_id, cache_key);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$ 
BEGIN
  -- Create select policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'select_own_audio_cache'
  ) THEN
    CREATE POLICY select_own_audio_cache ON audio_cache
      FOR SELECT TO public
      USING (user_id = auth.uid());
  END IF;

  -- Create insert policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'insert_own_audio_cache'
  ) THEN
    CREATE POLICY insert_own_audio_cache ON audio_cache
      FOR INSERT TO public
      WITH CHECK (user_id = auth.uid());
  END IF;

  -- Create update policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'update_own_audio_cache'
  ) THEN
    CREATE POLICY update_own_audio_cache ON audio_cache
      FOR UPDATE TO public
      USING (user_id = auth.uid());
  END IF;

  -- Create delete policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'delete_own_audio_cache'
  ) THEN
    CREATE POLICY delete_own_audio_cache ON audio_cache
      FOR DELETE TO public
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Create or replace cleanup function for expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_audio_cache() 
RETURNS TRIGGER AS $$
BEGIN
  -- Delete expired entries
  DELETE FROM audio_cache WHERE expires_at < now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if trigger exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'audio_cache_cleanup_trigger' AND tgrelid = 'audio_cache'::regclass
  ) THEN
    -- Create trigger to automatically cleanup on insert or update
    CREATE TRIGGER audio_cache_cleanup_trigger
      AFTER INSERT OR UPDATE ON audio_cache
      FOR EACH ROW
      EXECUTE FUNCTION cleanup_expired_audio_cache();
  END IF;
END $$;

-- Create or replace scheduled job function
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_audio_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM audio_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Add or update comments
COMMENT ON TABLE audio_cache IS 'Stores cached audio data for text-to-speech responses';
COMMENT ON COLUMN audio_cache.cache_key IS 'Unique key for identifying cached audio';
COMMENT ON COLUMN audio_cache.audio_data IS 'Binary audio data';
COMMENT ON COLUMN audio_cache.expires_at IS 'Timestamp when this cache entry expires';