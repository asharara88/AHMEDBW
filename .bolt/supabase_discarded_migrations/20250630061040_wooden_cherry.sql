/*
  # Audio Cache System
  
  1. New Tables
    - `audio_cache` table to store audio data with automatic expiration
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `cache_key` (text, required)
      - `audio_data` (bytea, required)
      - `content_type` (text, default 'audio/mpeg')
      - `created_at` (timestamp)
      - `expires_at` (timestamp, required)
  
  2. Indexes & Performance
    - Index on `expires_at` for efficient cleanup operations
    - Unique index on `(user_id, cache_key)` for fast lookups
    - Additional indexes on frequently queried columns
  
  3. Security
    - Row Level Security with user-specific policies
    - Ensures users can only access their own audio cache data
  
  4. Automation
    - Trigger for automatic cleanup of expired cache entries
*/

-- Create audio_cache table with a different name to avoid conflicts
CREATE TABLE IF NOT EXISTS audio_cache_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  audio_data BYTEA NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'audio/mpeg',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- If the original table exists, copy data and then drop/rename tables
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audio_cache') THEN
    -- Copy data from old table to new table
    INSERT INTO audio_cache_new (id, user_id, cache_key, audio_data, content_type, created_at, expires_at)
    SELECT id, user_id, cache_key, audio_data, content_type, created_at, expires_at 
    FROM audio_cache
    ON CONFLICT (id) DO NOTHING;
    
    -- Drop the old table
    DROP TABLE audio_cache;
  END IF;
  
  -- Rename the new table to the original name
  ALTER TABLE IF EXISTS audio_cache_new RENAME TO audio_cache;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx ON audio_cache(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS audio_cache_user_id_cache_key_idx ON audio_cache(user_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_audio_cache_cache_key ON audio_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_audio_cache_expires_at ON audio_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_audio_cache_user_id ON audio_cache(user_id);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for audio_cache
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audio_cache' AND policyname = 'Users can view their own audio cache') THEN
    CREATE POLICY "Users can view their own audio cache"
      ON audio_cache
      FOR SELECT
      TO public
      USING (user_id = uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audio_cache' AND policyname = 'Users can insert their own audio cache') THEN
    CREATE POLICY "Users can insert their own audio cache"
      ON audio_cache
      FOR INSERT
      TO public
      WITH CHECK (user_id = uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audio_cache' AND policyname = 'Users can update their own audio cache') THEN
    CREATE POLICY "Users can update their own audio cache"
      ON audio_cache
      FOR UPDATE
      TO public
      USING (user_id = uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audio_cache' AND policyname = 'Users can delete their own audio cache') THEN
    CREATE POLICY "Users can delete their own audio cache"
      ON audio_cache
      FOR DELETE
      TO public
      USING (user_id = uid());
  END IF;
END $$;

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