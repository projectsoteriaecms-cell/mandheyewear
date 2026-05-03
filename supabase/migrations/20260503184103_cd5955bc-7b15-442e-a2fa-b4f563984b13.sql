
-- 1. Restrict cost_price column from public read access
REVOKE SELECT (cost_price) ON public.products FROM anon, authenticated;

-- 2. Add storage policies for email-assets bucket: only admins/super_admins can write
CREATE POLICY "Admins can upload email assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'email-assets'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
);

CREATE POLICY "Admins can update email assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'email-assets'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
);

CREATE POLICY "Admins can delete email assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'email-assets'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
);

-- 3. Restrict realtime.messages so users can only subscribe to their own user-scoped notification channels
CREATE POLICY "Users can subscribe to their own notification channel"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  (realtime.topic() = 'notifications:' || auth.uid()::text)
  OR realtime.topic() NOT LIKE 'notifications:%'
);
