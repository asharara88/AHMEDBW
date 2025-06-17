/*
  # Audio Cache System

  1. New Tables
    - `audio_cache` - Stores cached audio data with expiration
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `cache_key` (text)
      - `audio_data` (bytea)
      - `content_type` (text)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
  
  2. Indexes
    - Unique index on (user_id, cache_key)
    - Index on expires_at for cleanup operations
  
  3. Security
    - Enable RLS on audio_cache table
    - Add policies for users to manage their own cache entries
  
  4. Functions
    - Cleanup function for expired cache entries
    - Trigger function to run cleanup automatically
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

-- Create unique index on user_id and cache_key
CREATE UNIQUE INDEX IF NOT EXISTS audio_cache_user_id_cache_key_idx ON audio_cache (user_id, cache_key);

-- Create index on expires_at for cleanup operations
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx ON audio_cache (expires_at);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "select_own_audio_cache"
  ON audio_cache
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "insert_own_audio_cache"
  ON audio_cache
  FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_audio_cache"
  ON audio_cache
  FOR UPDATE
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "delete_own_audio_cache"
  ON audio_cache
  FOR DELETE
  TO public
  USING (user_id = auth.uid());

-- Drop existing functions if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'cleanup_expired_audio_cache' 
    AND pg_function_is_visible(oid)
  ) THEN
    DROP FUNCTION cleanup_expired_audio_cache();
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'trigger_cleanup_expired_audio_cache' 
    AND pg_function_is_visible(oid)
  ) THEN
    DROP FUNCTION trigger_cleanup_expired_audio_cache();
  END IF;
END $$;

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

-- Create a trigger function to automatically clean up expired entries
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

-- Create a trigger that runs the cleanup function periodically
CREATE TRIGGER audio_cache_cleanup_trigger
AFTER INSERT OR UPDATE ON audio_cache
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_cleanup_expired_audio_cache();