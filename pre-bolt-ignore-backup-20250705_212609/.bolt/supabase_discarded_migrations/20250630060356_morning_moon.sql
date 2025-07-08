/*
  # Audio Cache System

  1. New Tables
    - `audio_cache` - Stores cached audio data for text-to-speech responses
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users.id)
      - `cache_key` (text)
      - `audio_data` (bytea)
      - `content_type` (text)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
  2. Indexes & Performance
    - Index on `expires_at` for efficient cleanup operations
    - Unique index on `(user_id, cache_key)` for fast lookups
  3. Security
    - Row Level Security enabled with user-specific policies
  4. Automation
    - Trigger for automatic cleanup of expired cache entries
*/

-- Create audio_cache table
CREATE TABLE IF NOT EXISTS audio_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  audio_data BYTEA NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'audio/mpeg',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx ON audio_cache(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS audio_cache_user_id_cache_key_idx ON audio_cache(user_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_audio_cache_cache_key ON audio_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_audio_cache_expires_at ON audio_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_audio_cache_user_id ON audio_cache(user_id);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for audio_cache
CREATE POLICY IF NOT EXISTS "Users can view their own audio cache"
  ON audio_cache
  FOR SELECT
  TO public
  USING (user_id = uid());

CREATE POLICY IF NOT EXISTS "Users can insert their own audio cache"
  ON audio_cache
  FOR INSERT
  TO public
  WITH CHECK (user_id = uid());

CREATE POLICY IF NOT EXISTS "Users can update their own audio cache"
  ON audio_cache
  FOR UPDATE
  TO public
  USING (user_id = uid());

CREATE POLICY IF NOT EXISTS "Users can delete their own audio cache"
  ON audio_cache
  FOR DELETE
  TO public
  USING (user_id = uid());

-- Create duplicate policies with different names to ensure they exist
CREATE POLICY IF NOT EXISTS "select_own_audio_cache"
  ON audio_cache
  FOR SELECT
  TO public
  USING (user_id = uid());

CREATE POLICY IF NOT EXISTS "insert_own_audio_cache"
  ON audio_cache
  FOR INSERT
  TO public
  WITH CHECK (user_id = uid());

CREATE POLICY IF NOT EXISTS "update_own_audio_cache"
  ON audio_cache
  FOR UPDATE
  TO public
  USING (user_id = uid());

CREATE POLICY IF NOT EXISTS "delete_own_audio_cache"
  ON audio_cache
  FOR DELETE
  TO public
  USING (user_id = uid());

-- Create function to clean up expired audio cache entries
CREATE OR REPLACE FUNCTION trigger_cleanup_audio_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete expired entries
  DELETE FROM audio_cache WHERE expires_at < now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up expired audio cache entries after insert or update
DROP TRIGGER IF EXISTS auto_cleanup_audio_cache ON audio_cache;
CREATE TRIGGER auto_cleanup_audio_cache
  AFTER INSERT OR UPDATE ON audio_cache
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_audio_cache();

-- Create function to clean up expired audio cache entries on schedule
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_audio_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete expired entries
  DELETE FROM audio_cache WHERE expires_at < now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;