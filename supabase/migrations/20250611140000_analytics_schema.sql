/*
  # Analytics System Schema and Optimizations

  1. New Tables
    - analytics_events: Stores all analytics events
    - performance_metrics: Stores performance monitoring data
    - error_logs: Stores detailed error information
    - health_analytics: Stores health outcome metrics
    - supplement_analytics: Tracks supplement usage
    - chat_analytics: Tracks AI coach interactions
    - goal_analytics: Tracks goal progress
    - conversion_analytics: Tracks business conversions

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to access their own rows
    - Service role policy for analytics processing

  3. Performance Optimizations
    - Add indexes on frequently queried columns
    - Create a materialized view for daily event counts
*/

-- ===================================
-- Table Definitions
-- ===================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL,
  metric text NOT NULL,
  value numeric NOT NULL,
  measured_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL,
  message text NOT NULL,
  details jsonb DEFAULT '{}',
  logged_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  metric text NOT NULL,
  value numeric NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplement_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  supplement_id uuid,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  message_type text NOT NULL,
  tokens integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goal_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  goal_id uuid,
  progress numeric NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversion_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  conversion_type text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- ===================================
-- Indexes for performance
-- ===================================
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS performance_metrics_service_idx ON performance_metrics (service);
CREATE INDEX IF NOT EXISTS error_logs_service_idx ON error_logs (service);
CREATE INDEX IF NOT EXISTS health_analytics_user_id_idx ON health_analytics (user_id);
CREATE INDEX IF NOT EXISTS supplement_analytics_user_id_idx ON supplement_analytics (user_id);
CREATE INDEX IF NOT EXISTS chat_analytics_user_id_idx ON chat_analytics (user_id);
CREATE INDEX IF NOT EXISTS goal_analytics_user_id_idx ON goal_analytics (user_id);
CREATE INDEX IF NOT EXISTS conversion_analytics_user_id_idx ON conversion_analytics (user_id);

-- ===================================
-- Enable Row Level Security
-- ===================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_analytics ENABLE ROW LEVEL SECURITY;

-- ===================================
-- Policies for authenticated users
-- ===================================
CREATE POLICY IF NOT EXISTS "Users can manage their analytics events"
  ON analytics_events FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage their performance metrics"
  ON performance_metrics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can manage their error logs"
  ON error_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can manage their health analytics"
  ON health_analytics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage their supplement analytics"
  ON supplement_analytics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage their chat analytics"
  ON chat_analytics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage their goal analytics"
  ON goal_analytics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage their conversion analytics"
  ON conversion_analytics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY IF NOT EXISTS "service_role_access_events"
  ON analytics_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ===================================
-- Materialized views
-- ===================================
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_event_counts AS
SELECT date_trunc('day', created_at) AS day, count(*) AS event_count
FROM analytics_events
GROUP BY day
WITH NO DATA;

-- ===================================
-- Autovacuum and analyze settings
-- ===================================
ALTER TABLE analytics_events SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE analytics_events SET (autovacuum_analyze_scale_factor = 0.02);
