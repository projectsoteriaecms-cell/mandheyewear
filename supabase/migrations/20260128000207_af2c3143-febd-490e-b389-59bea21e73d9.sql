-- Create notification type enum
CREATE TYPE public.notification_type AS ENUM ('info', 'warning', 'error', 'success', 'low_stock', 'new_order', 'transfer_request', 'appointment');

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System/triggers can insert notifications for any user (using service role or SECURITY DEFINER functions)
CREATE POLICY "Staff can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'branch_staff'::app_role) OR 
  has_role(auth.uid(), 'branch_manager'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to create notifications for all staff
CREATE OR REPLACE FUNCTION public.create_staff_notification(
  p_title TEXT,
  p_message TEXT,
  p_type notification_type DEFAULT 'info',
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, link, metadata)
  SELECT ur.user_id, p_title, p_message, p_type, p_link, p_metadata
  FROM user_roles ur
  WHERE ur.role IN ('branch_staff', 'branch_manager', 'super_admin');
END;
$$;

-- Create function to create notification for specific user
CREATE OR REPLACE FUNCTION public.create_user_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type notification_type DEFAULT 'info',
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, link, metadata)
  VALUES (p_user_id, p_title, p_message, p_type, p_link, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;