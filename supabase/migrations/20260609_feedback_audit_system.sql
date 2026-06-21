-- M&H Eyewear: Feedback & Audit System
-- Captures user activity, errors, and enables automated QA

-- Error Logs (frontend + backend errors)
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL, -- 'frontend', 'auth', 'api', 'database'
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Feedback (explicit feedback from users)
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL, -- 'bug', 'feature_request', 'compliment', 'complaint'
  category TEXT, -- 'auth', 'checkout', 'product_search', 'images', 'mobile', 'performance'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  page_context TEXT, -- which page/feature
  status TEXT DEFAULT 'new', -- 'new', 'reviewed', 'in_progress', 'fixed', 'wontfix'
  assignee TEXT, -- admin email
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Page & Feature Analytics (lightweight tracking)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'product_view', 'search', 'filter', 'checkout_start', 'checkout_complete', 'click'
  page_path TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- anonymous session for non-logged-in users
  metadata JSONB DEFAULT '{}', -- query params, filters applied, etc
  duration_ms INTEGER, -- how long on page
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- QA Audit Results (periodic health checks)
CREATE TABLE IF NOT EXISTS public.qa_audit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL, -- 'link_check', 'auth_flow', 'data_integrity', 'security', 'performance', 'seo'
  status TEXT NOT NULL, -- 'pass', 'warning', 'fail'
  passed INTEGER, -- count of checks that passed
  failed INTEGER, -- count of checks that failed
  warnings INTEGER, -- count of warnings
  details JSONB DEFAULT '{}', -- detailed results and recommendations
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suggested Fixes (auto-generated from audit results)
CREATE TABLE IF NOT EXISTS public.suggested_fixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_result_id UUID REFERENCES public.qa_audit_results(id) ON DELETE CASCADE,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  issue_type TEXT NOT NULL, -- 'dead_link', 'auth_failure', 'data_mismatch', 'security_gap', 'perf_degradation'
  description TEXT NOT NULL,
  affected_resource TEXT, -- URL, product_id, function name, etc
  suggested_action TEXT,
  auto_fixable BOOLEAN DEFAULT FALSE,
  auto_fix_command TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'reviewed', 'implemented', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  implemented_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_fixes ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity, created_at DESC);
CREATE INDEX idx_error_logs_user ON public.error_logs(user_id);
CREATE INDEX idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX idx_analytics_page ON public.analytics_events(page_path, created_at DESC);
CREATE INDEX idx_analytics_product ON public.analytics_events(product_id);
CREATE INDEX idx_qa_audit_type ON public.qa_audit_results(audit_type, created_at DESC);
CREATE INDEX idx_suggested_fixes_status ON public.suggested_fixes(status);

-- RLS Policies (admins can see everything, users can see their own)
CREATE POLICY "error_logs_admin" ON public.error_logs
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM public.admin_users
  ));

CREATE POLICY "user_feedback_own" ON public.user_feedback
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_feedback_insert" ON public.user_feedback
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "analytics_insert" ON public.analytics_events
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);
