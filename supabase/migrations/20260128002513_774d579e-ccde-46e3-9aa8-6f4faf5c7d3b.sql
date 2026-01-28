-- Create style_polls table for defining poll questions
CREATE TABLE public.style_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  poll_type TEXT NOT NULL DEFAULT 'single_select' CHECK (poll_type IN ('single_select', 'multi_select', 'rating', 'text')),
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_responses table for storing user responses
CREATE TABLE public.poll_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  poll_id UUID NOT NULL REFERENCES public.style_polls(id) ON DELETE CASCADE,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_measurements table for storing face scan history
CREATE TABLE public.user_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measurement_type TEXT NOT NULL DEFAULT 'face_scan',
  face_width_mm NUMERIC(5,1),
  pupillary_distance_mm NUMERIC(5,1),
  bridge_width_mm NUMERIC(5,1),
  temple_width_mm NUMERIC(5,1),
  face_shape TEXT,
  confidence_score NUMERIC(3,2),
  image_url TEXT,
  raw_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personalization_analytics table for aggregate insights
CREATE TABLE public.personalization_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.style_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalization_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for style_polls (public read, admin write)
CREATE POLICY "Anyone can view active polls" 
ON public.style_polls 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage polls"
ON public.style_polls
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for poll_responses (users own their responses)
CREATE POLICY "Users can view their own responses"
ON public.poll_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own responses"
ON public.poll_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
ON public.poll_responses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all responses for analytics"
ON public.poll_responses
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'branch_manager'));

-- RLS Policies for user_measurements (users own their measurements)
CREATE POLICY "Users can view their own measurements"
ON public.user_measurements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own measurements"
ON public.user_measurements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements"
ON public.user_measurements
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all measurements for analytics"
ON public.user_measurements
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for personalization_analytics (admin only)
CREATE POLICY "Admins can view analytics"
ON public.personalization_analytics
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'branch_manager'));

CREATE POLICY "System can insert analytics"
ON public.personalization_analytics
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_poll_responses_user_id ON public.poll_responses(user_id);
CREATE INDEX idx_poll_responses_poll_id ON public.poll_responses(poll_id);
CREATE INDEX idx_user_measurements_user_id ON public.user_measurements(user_id);
CREATE INDEX idx_personalization_analytics_metric_type ON public.personalization_analytics(metric_type);
CREATE INDEX idx_personalization_analytics_period ON public.personalization_analytics(period_start, period_end);

-- Add updated_at trigger for style_polls
CREATE TRIGGER update_style_polls_updated_at
BEFORE UPDATE ON public.style_polls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial lifestyle poll questions
INSERT INTO public.style_polls (question, poll_type, options, category, display_order) VALUES
('What''s most important to you when choosing eyewear?', 'single_select', '["Comfort", "Style", "Durability", "Price", "Brand"]'::jsonb, 'lifestyle', 1),
('How often do you typically change your glasses?', 'single_select', '["Every year", "Every 2 years", "Every 3+ years", "Only when needed"]'::jsonb, 'lifestyle', 2),
('Where do you primarily wear your glasses?', 'multi_select', '["Office/Work", "Outdoor activities", "Driving", "Reading", "All-day wear", "Special occasions"]'::jsonb, 'lifestyle', 3),
('What activities do you do most while wearing glasses?', 'multi_select', '["Computer work", "Reading", "Sports", "Driving", "Socializing", "Creative work"]'::jsonb, 'lifestyle', 4),
('How would you describe your personal style?', 'single_select', '["Classic & Traditional", "Modern & Minimalist", "Bold & Trendy", "Professional & Refined", "Casual & Relaxed"]'::jsonb, 'lifestyle', 5);