-- Migration: Behavioral Event Tracking (Phase 1)
-- Purpose: Create core event logging infrastructure for user behavior analytics
-- Date: 2026-06-20

-- Event type enum
CREATE TYPE public.event_type AS ENUM (
  'viewed_product',           -- User viewed a product
  'used_vto',                 -- User used Virtual Try-On
  'added_to_cart',            -- User added item to cart
  'removed_from_cart',        -- User removed item from cart
  'completed_order',          -- User placed order
  'clicked_email',            -- User clicked email link
  'opened_email',             -- User opened email
  'bounced_email',            -- Email bounced
  'unsubscribed_email',       -- User unsubscribed
  'viewed_appointment_page',  -- User viewed appointment booking
  'booked_appointment',       -- User booked appointment
  'visited_page',             -- Generic page visit
  'searched_product',         -- User searched for product
  'viewed_frame_details',     -- User viewed frame/product details
  'abandoned_cart',           -- User abandoned cart (system-computed)
  'engagement_reminder_sent'  -- Re-engagement email sent
);

-- Core event log table
CREATE TABLE public.user_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,                           -- Normalized email (crm_contacts key)
  event_type      public.event_type NOT NULL,
  event_data      JSONB DEFAULT '{}',                     -- Flexible metadata (product_id, page_url, etc)
  source          TEXT DEFAULT 'web',                     -- web, email, app, manual
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_user_events_email ON public.user_events(email);
CREATE INDEX idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX idx_user_events_created_at ON public.user_events(created_at);
CREATE INDEX idx_user_events_email_created ON public.user_events(email, created_at DESC);

-- Table for behavioral segment assignments (computed, cached)
CREATE TABLE public.user_behavioral_segments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                     TEXT NOT NULL UNIQUE,  -- References crm_contacts (which is a view)
  segment_name              TEXT NOT NULL,  -- 'high_intent', 'engaged_buyer', 'at_risk', etc
  confidence_score          NUMERIC(3,2) DEFAULT 1.0,  -- 0-1, how confident we are
  reason                    TEXT,           -- Why assigned to this segment
  last_computed_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_user_behavioral_segments_email ON public.user_behavioral_segments(email);
CREATE INDEX idx_user_behavioral_segments_segment ON public.user_behavioral_segments(segment_name);

-- RLS policies for user_events
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_events" ON public.user_events
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "manager_write_events" ON public.user_events
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- RLS for behavioral segments
ALTER TABLE public.user_behavioral_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_behavioral_segments" ON public.user_behavioral_segments
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "manager_write_behavioral_segments" ON public.user_behavioral_segments
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'super_admin')
  );
