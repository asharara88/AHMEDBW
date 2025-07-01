/*
  # Fix Audio Cache Table

  1. New Tables
    - Recreates `audio_cache` table with proper schema
  2. Security
    - Drops existing policies before creating new ones
    - Enables RLS on `audio_cache` table
    - Adds policies for authenticated users to manage their own cache
  3. Automation
    - Creates function and trigger for automatic cleanup of expired entries
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS audio_cache;

-- Create audio_cache table
CREATE TABLE audio_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  audio_data BYTEA NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'audio/mpeg',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create indexes for performance
CREATE INDEX audio_cache_expires_at_idx ON audio_cache(expires_at);
CREATE UNIQUE INDEX audio_cache_user_id_cache_key_idx ON audio_cache(user_id, cache_key);
CREATE INDEX idx_audio_cache_cache_key ON audio_cache(cache_key);
CREATE INDEX idx_audio_cache_expires_at ON audio_cache(expires_at);
CREATE INDEX idx_audio_cache_user_id ON audio_cache(user_id);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own audio cache" ON audio_cache;
DROP POLICY IF EXISTS "Users can insert their own audio cache" ON audio_cache;
DROP POLICY IF EXISTS "Users can update their own audio cache" ON audio_cache;
DROP POLICY IF EXISTS "Users can delete their own audio cache" ON audio_cache;
DROP POLICY IF EXISTS "select_own_audio_cache" ON audio_cache;
DROP POLICY IF EXISTS "insert_own_audio_cache" ON audio_cache;
DROP POLICY IF EXISTS "update_own_audio_cache" ON audio_cache;
DROP POLICY IF EXISTS "delete_own_audio_cache" ON audio_cache;

-- Create policies with new names to avoid conflicts
CREATE POLICY "view_own_audio_cache"
  ON audio_cache
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "add_own_audio_cache"
  ON audio_cache
  FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "modify_own_audio_cache"
  ON audio_cache
  FOR UPDATE
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "remove_own_audio_cache"
  ON audio_cache
  FOR DELETE
  TO public
  USING (user_id = auth.uid());

-- Create function to clean up expired audio cache entries
CREATE OR REPLACE FUNCTION trigger_cleanup_audio_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete expired entries
  DELETE FROM audio_cache WHERE expires_at < now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_cleanup_audio_cache ON audio_cache;

-- Create trigger to clean up expired audio cache entries after insert or update
CREATE TRIGGER auto_cleanup_audio_cache
  AFTER INSERT OR UPDATE ON audio_cache
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_audio_cache();

COMMENT ON TABLE audio_cache IS 'Stores cached audio data for text-to-speech responses';
COMMENT ON COLUMN audio_cache.cache_key IS 'Unique key for identifying cached audio';
COMMENT ON COLUMN audio_cache.audio_data IS 'Binary audio data';
COMMENT ON COLUMN audio_cache.expires_at IS 'Timestamp when this cache entry expires';