/*
  # Audio Cache System

  1. New Tables
    - `audio_cache`: Stores cached audio data for text-to-speech responses
  
  2. Indexes
    - Index on `expires_at` for efficient cleanup operations
    - Unique index on `(user_id, cache_key)` for fast lookups
  
  3. Security
    - Row Level Security with user-specific policies
  
  4. Automation
    - Trigger for automatic cleanup of expired cache entries
*/

-- Create audio_cache table
CREATE TABLE IF NOT EXISTS audio_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key text NOT NULL,
  audio_data bytea NOT NULL,
  content_type text NOT NULL DEFAULT 'audio/mpeg',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx ON audio_cache(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS audio_cache_user_id_cache_key_idx ON audio_cache(user_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_audio_cache_cache_key ON audio_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_audio_cache_user_id ON audio_cache(user_id);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own audio cache" ON audio_cache;
DROP POLICY IF EXISTS "Users can insert their own audio cache" ON audio_cache;
DROP POLICY IF EXISTS "Users can update their own audio cache" ON audio_cache;
DROP POLICY IF EXISTS "Users can delete their own audio cache" ON audio_cache;

-- Create policies for audio_cache
CREATE POLICY "Users can view their own audio cache"
  ON audio_cache
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own audio cache"
  ON audio_cache
  FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own audio cache"
  ON audio_cache
  FOR UPDATE
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own audio cache"
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

-- Add comments for documentation
COMMENT ON TABLE audio_cache IS 'Stores cached audio data for text-to-speech responses';
COMMENT ON COLUMN audio_cache.cache_key IS 'Unique key for identifying cached audio';
COMMENT ON COLUMN audio_cache.audio_data IS 'Binary audio data';
COMMENT ON COLUMN audio_cache.expires_at IS 'Timestamp when this cache entry expires';