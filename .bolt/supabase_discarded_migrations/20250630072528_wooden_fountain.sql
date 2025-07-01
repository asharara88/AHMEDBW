/*
  # Fix Audio Cache Table

  1. New Tables
     - Recreates `audio_cache` table if needed
     - Ensures all necessary indexes exist
  
  2. Security
     - Enables RLS on the table
     - Creates policies with proper checks to avoid duplicates
  
  3. Maintenance
     - Adds cleanup function and trigger for expired entries
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx ON audio_cache(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS audio_cache_user_id_cache_key_idx ON audio_cache(user_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_audio_cache_cache_key ON audio_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_audio_cache_expires_at ON audio_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_audio_cache_user_id ON audio_cache(user_id);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist using PL/pgSQL to check first
DO $$
BEGIN
  -- Check if select policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'select_own_audio_cache'
  ) THEN
    CREATE POLICY select_own_audio_cache ON audio_cache
      FOR SELECT TO public
      USING (user_id = auth.uid());
  END IF;

  -- Check if insert policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'insert_own_audio_cache'
  ) THEN
    CREATE POLICY insert_own_audio_cache ON audio_cache
      FOR INSERT TO public
      WITH CHECK (user_id = auth.uid());
  END IF;

  -- Check if update policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'update_own_audio_cache'
  ) THEN
    CREATE POLICY update_own_audio_cache ON audio_cache
      FOR UPDATE TO public
      USING (user_id = auth.uid());
  END IF;

  -- Check if delete policy exists
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
CREATE OR REPLACE FUNCTION trigger_cleanup_audio_cache() 
RETURNS TRIGGER AS $$
BEGIN
  -- Delete expired entries
  DELETE FROM audio_cache WHERE expires_at < now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS auto_cleanup_audio_cache ON audio_cache;

-- Create trigger to automatically cleanup on insert or update
CREATE TRIGGER auto_cleanup_audio_cache
  AFTER INSERT OR UPDATE ON audio_cache
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_audio_cache();

-- Add comments for documentation
COMMENT ON TABLE audio_cache IS 'Stores cached audio data for text-to-speech responses';
COMMENT ON COLUMN audio_cache.cache_key IS 'Unique key for identifying cached audio';
COMMENT ON COLUMN audio_cache.audio_data IS 'Binary audio data';
COMMENT ON COLUMN audio_cache.expires_at IS 'Timestamp when this cache entry expires';