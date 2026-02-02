-- Create vto_email_leads table for capturing emails from Virtual Try-On downloads
CREATE TABLE public.vto_email_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  frame_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  frame_name TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'vto_download',
  user_id UUID,
  try_on_image_url TEXT
);

-- Enable Row Level Security
ALTER TABLE public.vto_email_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert leads (for guest email capture)
CREATE POLICY "Anyone can insert VTO leads"
ON public.vto_email_leads
FOR INSERT
WITH CHECK (true);

-- Policy: Only authenticated admins (super_admin, branch_manager) can read leads
CREATE POLICY "Admins can view VTO leads"
ON public.vto_email_leads
FOR SELECT
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role) OR
  public.has_role(auth.uid(), 'branch_manager'::app_role)
);

-- Policy: Only super_admins can update leads
CREATE POLICY "Super admins can update VTO leads"
ON public.vto_email_leads
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Policy: Only super_admins can delete leads
CREATE POLICY "Super admins can delete VTO leads"
ON public.vto_email_leads
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Create an index for email lookups and analytics
CREATE INDEX idx_vto_email_leads_email ON public.vto_email_leads(email);
CREATE INDEX idx_vto_email_leads_created_at ON public.vto_email_leads(created_at DESC);
CREATE INDEX idx_vto_email_leads_frame_id ON public.vto_email_leads(frame_id);