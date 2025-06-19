/*
  # Audio Cache Table with Cleanup Trigger

  1. New Tables
    - `audio_cache` - Stores audio data with automatic expiration
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `cache_key` (text, unique identifier for the cached item)
      - `audio_data` (bytea, the actual audio data)
      - `content_type` (text, MIME type of the audio)
      - `created_at` (timestamp with time zone)
      - `expires_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `audio_cache` table
    - Add policies for users to manage their own audio cache

  3. Triggers
    - Add trigger to automatically clean up expired audio cache entries
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

-- Create index on user_id and cache_key for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS audio_cache_user_id_cache_key_idx ON audio_cache(user_id, cache_key);

-- Create index on expires_at for efficient cleanup
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx ON audio_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own audio cache
CREATE POLICY "Users can read their own audio cache"
  ON audio_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio cache"
  ON audio_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio cache"
  ON audio_cache
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio cache"
  ON audio_cache
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to clean up expired audio cache entries
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_audio_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete expired audio cache entries
  DELETE FROM audio_cache
  WHERE expires_at < now();
  
  -- Also delete entries older than 3 months regardless of expiry
  DELETE FROM audio_cache
  WHERE created_at < (now() - INTERVAL '3 months');
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run cleanup function after each insert
CREATE TRIGGER cleanup_expired_audio_cache_trigger
AFTER INSERT ON audio_cache
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_cleanup_expired_audio_cache();

-- Add comment to explain the table's purpose
COMMENT ON TABLE audio_cache IS 'Stores cached audio data with automatic expiration for text-to-speech responses';