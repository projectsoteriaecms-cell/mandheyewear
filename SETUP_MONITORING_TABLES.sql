-- ════════════════════════════════════════════════════════════════════════════
-- MONITORING & QA FRAMEWORK SETUP
-- Run this SQL script in Supabase to create all monitoring tables
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE 1: IMAGE GENERATION LOGS (Every attempt)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.image_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  frame_id UUID,

  -- Generation details
  generation_type TEXT, -- 'virtual_tryon', 'admin_individual', 'batch'
  mode TEXT, -- 'plan', 'check', 'do', 'act'

  -- Each angle/shot
  shot_number INTEGER, -- 1-6 (which angle)
  shot_type TEXT, -- 'hero', 'front', 'mannequin', 'lifestyle_male', 'lifestyle_female', 'spec_diagram'

  -- Status
  status TEXT, -- 'started', 'success', 'failed', 'retrying'

  -- Timing
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER, -- end_time - start_time in milliseconds

  -- Result
  image_url TEXT,
  error_code TEXT,
  error_message TEXT,

  -- Attempt tracking
  attempt_number INTEGER DEFAULT 1,
  max_retries INTEGER DEFAULT 3,

  -- Performance
  api_calls_used INTEGER,
  api_cost_estimate DECIMAL(10,4),

  -- User device context
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  os_name TEXT, -- 'iOS', 'Android', 'Windows', 'macOS'
  browser_name TEXT,
  device_memory_mb INTEGER,

  -- Metadata
  metadata JSONB, -- flexible storage for additional context

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.image_generation_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_generation_logs_user ON image_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_product ON image_generation_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON image_generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created ON image_generation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_generation_logs_error ON image_generation_logs(error_code);
CREATE INDEX IF NOT EXISTS idx_generation_logs_shot_type ON image_generation_logs(shot_type);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE 2: IMAGE GENERATION ERRORS (Failure tracking)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.image_generation_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  log_id UUID REFERENCES image_generation_logs(id) ON DELETE CASCADE,

  -- Error classification
  error_type TEXT, -- 'api_error', 'timeout', 'face_detection', 'frame_fit', 'memory', 'auth', 'network', 'unknown'
  error_code TEXT, -- '401', '429', '500', 'TIMEOUT', 'FACE_NOT_DETECTED', etc.
  error_message TEXT,
  stack_trace TEXT,

  -- Severity
  severity TEXT, -- 'critical', 'high', 'medium', 'low'

  -- Recovery
  auto_retry_scheduled BOOLEAN DEFAULT FALSE,
  retry_count INTEGER DEFAULT 0,
  retry_successful BOOLEAN,

  -- User impact
  user_visible BOOLEAN DEFAULT TRUE, -- should user see this error?
  suggested_action TEXT, -- "Try a different photo" or "API overloaded, retry in 30s"

  -- Root cause analysis
  suspected_cause TEXT,
  root_cause_confirmed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.image_generation_errors ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_errors_type ON image_generation_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_severity ON image_generation_errors(severity);
CREATE INDEX IF NOT EXISTS idx_errors_created ON image_generation_errors(created_at);
CREATE INDEX IF NOT EXISTS idx_errors_log_id ON image_generation_errors(log_id);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE 3: IMAGE GENERATION METRICS (Aggregated stats - updated hourly)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.image_generation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Time bucket
  hour TIMESTAMP WITH TIME ZONE,
  date DATE,

  -- Counts
  total_attempts INTEGER DEFAULT 0,
  successful INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  retried INTEGER DEFAULT 0,

  -- Rates
  success_rate DECIMAL(5,2), -- 95.5
  failure_rate DECIMAL(5,2),
  average_retries DECIMAL(5,2),

  -- Performance
  avg_duration_ms INTEGER,
  p50_duration_ms INTEGER, -- median
  p95_duration_ms INTEGER, -- 95th percentile
  max_duration_ms INTEGER,

  -- Errors
  api_errors INTEGER DEFAULT 0,
  timeout_errors INTEGER DEFAULT 0,
  face_detection_errors INTEGER DEFAULT 0,
  frame_fit_errors INTEGER DEFAULT 0,
  memory_errors INTEGER DEFAULT 0,
  auth_errors INTEGER DEFAULT 0,
  network_errors INTEGER DEFAULT 0,
  unknown_errors INTEGER DEFAULT 0,

  -- Device breakdown
  mobile_success_rate DECIMAL(5,2),
  desktop_success_rate DECIMAL(5,2),
  tablet_success_rate DECIMAL(5,2),
  ios_success_rate DECIMAL(5,2),
  android_success_rate DECIMAL(5,2),

  -- Cost
  total_api_calls INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.image_generation_metrics ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_hour ON image_generation_metrics(hour);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON image_generation_metrics(date);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE 4: QA AUDIT RESULTS (Automated health checks)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.qa_audit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Audit run
  audit_type TEXT, -- 'daily', 'hourly', 'on_demand'
  audit_name TEXT, -- 'edge_function_health', 'gemini_api_health', 'frame_fitting_quality', etc.

  -- Results
  status TEXT, -- 'passed', 'failed', 'warning'
  score INTEGER DEFAULT 100, -- 0-100

  -- Checks
  checks_passed INTEGER DEFAULT 0,
  checks_failed INTEGER DEFAULT 0,
  checks_total INTEGER DEFAULT 0,

  -- Findings
  findings JSONB, -- {failed_checks: [...], warnings: [...], metrics: {...}}

  -- Alerts
  alert_triggered BOOLEAN DEFAULT FALSE,
  alert_severity TEXT, -- 'critical', 'high', 'medium', 'low'
  alert_recipients TEXT[], -- ['ops@...', 'dev@...']

  -- Performance
  duration_ms INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.qa_audit_results ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_qa_audit_type ON qa_audit_results(audit_type);
CREATE INDEX IF NOT EXISTS idx_qa_audit_status ON qa_audit_results(status);
CREATE INDEX IF NOT EXISTS idx_qa_audit_created ON qa_audit_results(created_at);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE 5: USER FEEDBACK (Track manual feedback)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Feedback
  feedback_type TEXT, -- 'positive', 'negative', 'bug_report', 'feature_request'
  message TEXT,

  -- Context
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  page TEXT, -- 'virtual_try_on', 'admin_dashboard', 'shop'

  -- Metadata
  device_type TEXT,
  browser_name TEXT,
  timestamp_reported TIMESTAMP WITH TIME ZONE,

  -- Status
  reviewed BOOLEAN DEFAULT FALSE,
  assigned_to TEXT, -- developer email
  status TEXT DEFAULT 'new', -- 'new', 'investigating', 'fixed', 'wontfix'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON user_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON user_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON user_feedback(user_id);

-- ════════════════════════════════════════════════════════════════════════════
-- VIEWS FOR MONITORING DASHBOARD
-- ════════════════════════════════════════════════════════════════════════════

-- Real-time success rate (last hour)
CREATE OR REPLACE VIEW v_success_rate_last_hour AS
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as successes,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate,
  COUNT(*) FILTER (WHERE status = 'failed') as failures
FROM image_generation_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY hour
ORDER BY hour DESC;

-- Error breakdown (last 24 hours)
CREATE OR REPLACE VIEW v_error_breakdown AS
SELECT
  error_type,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) /
    (SELECT COUNT(*) FROM image_generation_errors WHERE created_at > NOW() - INTERVAL '24 hours'), 2) as percentage,
  MAX(created_at) as last_occurrence
FROM image_generation_errors
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_type
ORDER BY count DESC;

-- Device breakdown (last 7 days)
CREATE OR REPLACE VIEW v_device_breakdown AS
SELECT
  device_type,
  os_name,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate,
  ROUND(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) * 1000)::numeric, 0) as avg_duration_ms
FROM image_generation_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY device_type, os_name
ORDER BY success_rate ASC;

-- Retry patterns (products needing multiple retries)
CREATE OR REPLACE VIEW v_retry_patterns AS
SELECT
  product_id,
  COUNT(DISTINCT user_id) as users_affected,
  COUNT(*) as total_attempts,
  MAX(attempt_number) as max_retries_needed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'failed') / COUNT(*), 2) as failure_rate
FROM image_generation_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY product_id
HAVING COUNT(*) > 5
ORDER BY max_retries_needed DESC;

-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICATION: Check that all tables exist
-- ════════════════════════════════════════════════════════════════════════════

SELECT
  'Tables Created Successfully' as status,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_name IN ('image_generation_logs', 'image_generation_errors',
                        'image_generation_metrics', 'qa_audit_results', 'user_feedback')) as table_count;

-- Run this to see the setup results:
-- SELECT * FROM v_success_rate_last_hour;
-- SELECT * FROM v_error_breakdown;
-- SELECT * FROM v_device_breakdown;
