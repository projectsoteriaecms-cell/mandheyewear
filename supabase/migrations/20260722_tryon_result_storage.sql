-- Try-on result storage: a bounded home for generated images.
--
-- Two problems this solves.
--
-- 1. COST. vto_email_leads.try_on_image_url currently holds a base64 data URL.
--    Only one of 161 leads has one, but that single row is 2.9MB -- ~90% of the
--    whole table. Base64 in Postgres is the most expensive place to keep an
--    image and it is never queried, only read back whole. Images move to
--    object storage; the column keeps a short path instead.
--
-- 2. WHATSAPP DELIVERY. Twilio fetches media from a URL -- base64 cannot be
--    attached inline. Without a real storage location there is no way to send
--    a try-on result to WhatsApp at all.
--
-- Retention model, deliberately tiered so cost tracks converted leads rather
-- than raw curiosity:
--
--   anonymous visitor, no contact given  -> nothing stored, ever
--   contact captured (lead)              -> stored, purged after 60 days
--   signed-in user's saved history       -> kept (highest-value, justified)
--
-- The purge itself runs in the platform-health-check function (already on a
-- 15-min pg_cron schedule): deleting a storage.objects row here would not free
-- the underlying object, so it has to go through the storage API.

-- ---------------------------------------------------------------------------
-- 1. Private bucket
-- ---------------------------------------------------------------------------
-- Private, not public: results are personal images of someone's face. Delivery
-- uses short-lived signed URLs (enough for Twilio/Resend to fetch), so the
-- objects are never openly enumerable.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'try-on-results',
  'try-on-results',
  false,
  10485760,                              -- 10MB ceiling; watermarked JPEGs run ~70KB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Storage access
-- ---------------------------------------------------------------------------
-- Uploads are allowed for anonymous visitors: try-on deliberately does not
-- require an account, and the image must exist before we can send it. Reads
-- are NOT public -- the service role signs URLs for delivery, and staff can
-- read for CRM follow-up context.

DROP POLICY IF EXISTS tryon_results_insert ON storage.objects;
CREATE POLICY tryon_results_insert ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'try-on-results');

DROP POLICY IF EXISTS tryon_results_staff_select ON storage.objects;
CREATE POLICY tryon_results_staff_select ON storage.objects
  FOR SELECT
  USING (bucket_id = 'try-on-results' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS tryon_results_owner_select ON storage.objects;
CREATE POLICY tryon_results_owner_select ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'try-on-results'
    AND auth.uid() IS NOT NULL
    -- Objects are stored under <user_id>/... for signed-in users.
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 3. Lead rows point at storage instead of embedding the image
-- ---------------------------------------------------------------------------

ALTER TABLE public.vto_email_leads
  ADD COLUMN IF NOT EXISTS image_path text,
  ADD COLUMN IF NOT EXISTS image_expires_at timestamptz;

COMMENT ON COLUMN public.vto_email_leads.image_path IS
  'Object path in the try-on-results bucket. Replaces base64 in try_on_image_url.';
COMMENT ON COLUMN public.vto_email_leads.image_expires_at IS
  'When the stored image becomes eligible for purging. NULL = keep (signed-in user history).';
COMMENT ON COLUMN public.vto_email_leads.try_on_image_url IS
  'DEPRECATED -- held base64 data URLs. Use image_path. Retained for the one historical row.';

CREATE INDEX IF NOT EXISTS vto_email_leads_image_expiry_idx
  ON public.vto_email_leads (image_expires_at)
  WHERE image_path IS NOT NULL AND image_expires_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 4. Purge candidates
-- ---------------------------------------------------------------------------
-- Returns paths whose retention window has passed. The caller (the health-check
-- Edge Function) removes them via the storage API and then calls
-- platform_mark_tryon_image_purged() so the row stops being returned.

CREATE OR REPLACE FUNCTION public.platform_get_expired_tryon_images()
RETURNS TABLE(id uuid, image_path text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT l.id, l.image_path
  FROM public.vto_email_leads l
  WHERE l.image_path IS NOT NULL
    AND l.image_expires_at IS NOT NULL
    AND l.image_expires_at < now()
  LIMIT 500;
$$;

COMMENT ON FUNCTION public.platform_get_expired_tryon_images() IS
  'Scheduler-safe. Try-on images past their retention window, for storage cleanup.';

GRANT EXECUTE ON FUNCTION public.platform_get_expired_tryon_images() TO service_role;

CREATE OR REPLACE FUNCTION public.platform_mark_tryon_image_purged(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.vto_email_leads
  SET image_path = NULL,
      image_expires_at = NULL
  WHERE id = p_id;
$$;

COMMENT ON FUNCTION public.platform_mark_tryon_image_purged(uuid) IS
  'Scheduler-safe. Clears the image reference once the object is actually deleted.';

GRANT EXECUTE ON FUNCTION public.platform_mark_tryon_image_purged(uuid) TO service_role;

-- ---------------------------------------------------------------------------
-- 5. NOT reclaiming the existing base64 row here -- deliberately
-- ---------------------------------------------------------------------------
-- One lead carries a 2.9MB data URL (~90% of this table). Clearing it is the
-- obvious cleanup, but it destroys a real customer's try-on image and a
-- migration is the wrong place to make that call silently. 2.9MB costs
-- essentially nothing, so it stays until someone decides otherwise:
--
--   UPDATE public.vto_email_leads
--   SET try_on_image_url = NULL
--   WHERE try_on_image_url LIKE 'data:%';
--
-- New writes go to storage, so this cannot grow.
