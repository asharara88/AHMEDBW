/*
  # Add Audio Cache Schema

  1. New Tables
    - `audio_cache`: Store generated audio for text-to-speech responses
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `cache_key` (text)
      - `audio_data` (bytea)
      - `content_type` (text)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
  
  2. Security
    - Enable RLS on `audio_cache` table
    - Add policies for authenticated users to manage their own audio cache
  
  3. Functions
    - Create function to cleanup expired audio cache entries
    - Create trigger to automatically cleanup on insert/update
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

-- Create indexes
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx ON audio_cache(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS audio_cache_user_id_cache_key_idx ON audio_cache(user_id, cache_key);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY select_own_audio_cache ON audio_cache
  FOR SELECT TO public
  USING (user_id = uid());

CREATE POLICY insert_own_audio_cache ON audio_cache
  FOR INSERT TO public
  WITH CHECK (user_id = uid());

CREATE POLICY update_own_audio_cache ON audio_cache
  FOR UPDATE TO public
  USING (user_id = uid());

CREATE POLICY delete_own_audio_cache ON audio_cache
  FOR DELETE TO public
  USING (user_id = uid());

-- Create cleanup function for expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_audio_cache() 
RETURNS TRIGGER AS $$
BEGIN
  -- Delete expired entries
  DELETE FROM audio_cache WHERE expires_at < now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically cleanup on insert or update
CREATE TRIGGER audio_cache_cleanup_trigger
  AFTER INSERT OR UPDATE ON audio_cache
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_expired_audio_cache();

-- Create a scheduled job function to periodically clean up expired entries
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_audio_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM audio_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE audio_cache IS 'Stores cached audio data for text-to-speech responses';
COMMENT ON COLUMN audio_cache.cache_key IS 'Unique key for identifying cached audio';
COMMENT ON COLUMN audio_cache.audio_data IS 'Binary audio data';
COMMENT ON COLUMN audio_cache.expires_at IS 'Timestamp when this cache entry expires';