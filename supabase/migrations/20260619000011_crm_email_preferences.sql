-- =============================================================================
-- T18: Email preference centre
--
-- Contacts manage per-category email preferences via a signed link in emails.
-- The preference page is served by the email-preference-page Edge Function.
--
-- Architecture notes:
--   - crm_contacts is a VIEW (keyed by normalized email, not UUID). All new
--     tables here are keyed by normalized email TEXT, not a UUID FK.
--   - crm_preference_tokens provides a secure per-email token used by the EF
--     to validate preference-page requests without requiring auth.
--   - crm_email_preferences stores the explicit per-category opt-in state.
--     Rows are upserted on form submit; missing rows = use category default.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. crm_email_preference_categories — lookup / seed
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_email_preference_categories (
  id                 TEXT    PRIMARY KEY,
  label              TEXT    NOT NULL,
  description        TEXT,
  sort_order         INT     NOT NULL DEFAULT 0,
  is_opt_in_default  BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO public.crm_email_preference_categories
  (id, label, description, sort_order, is_opt_in_default)
VALUES
  ('marketing',             'Marketing emails',       'Special offers, new products, and personalised promotions',         1, true),
  ('newsletter',            'Newsletter',             'Monthly newsletter with eye health tips and what''s new at Soteria', 2, true),
  ('appointment_reminders', 'Appointment reminders',  'Reminders for upcoming eye-care appointments and follow-ups',        3, true),
  ('promotions',            'Promotions & discounts', 'Seasonal campaigns and exclusive loyalty discounts',                 4, true)
ON CONFLICT (id) DO UPDATE
  SET label = EXCLUDED.label,
      description = EXCLUDED.description,
      sort_order = EXCLUDED.sort_order;

-- ---------------------------------------------------------------------------
-- 2. crm_email_preferences — per-email per-category opt-in state
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_email_preferences (
  email        TEXT    NOT NULL,  -- lower(trim(email)), matches crm_contacts.email
  category_id  TEXT    NOT NULL REFERENCES public.crm_email_preference_categories(id),
  opted_in     BOOLEAN NOT NULL DEFAULT true,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (email, category_id)
);

CREATE INDEX IF NOT EXISTS crm_email_prefs_email_idx ON public.crm_email_preferences (email);

-- ---------------------------------------------------------------------------
-- 3. crm_preference_tokens — one-per-email opaque token for preference links
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_preference_tokens (
  email        TEXT        PRIMARY KEY,  -- normalized (lower/trim)
  token        UUID        NOT NULL DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.crm_email_preference_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_preferences           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_preference_tokens           ENABLE ROW LEVEL SECURITY;

-- Categories: anyone authenticated can read
CREATE POLICY "crm_pref_cats_read" ON public.crm_email_preference_categories
  FOR SELECT TO authenticated USING (true);

-- Preferences: staff can read/write
CREATE POLICY "crm_email_prefs_staff_rw" ON public.crm_email_preferences
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- Tokens: staff can read (to build preference links), manager can rotate
CREATE POLICY "crm_pref_tokens_staff_read" ON public.crm_preference_tokens
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_pref_tokens_manager_write" ON public.crm_preference_tokens
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- ---------------------------------------------------------------------------
-- 5. crm_ensure_preference_token(p_email) → UUID
--
-- Idempotently creates a preference token for a contact. Called by admin UI
-- (authenticated JWT) when building preference URLs to embed in emails.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_ensure_preference_token(p_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email  TEXT := lower(trim(p_email));
  v_token  UUID;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.crm_preference_tokens (email)
  VALUES (v_email)
  ON CONFLICT (email) DO NOTHING;

  SELECT token INTO v_token FROM public.crm_preference_tokens WHERE email = v_email;
  RETURN v_token;
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. crm_rotate_preference_token(p_email) → UUID
--
-- Rotates the token for a contact, invalidating any existing preference links.
-- Managers only.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_rotate_preference_token(p_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email    TEXT := lower(trim(p_email));
  v_token    UUID := gen_random_uuid();
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.crm_preference_tokens (email, token, refreshed_at)
  VALUES (v_email, v_token, now())
  ON CONFLICT (email) DO UPDATE
    SET token = EXCLUDED.token,
        refreshed_at = now();

  RETURN v_token;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. crm_get_preference_stats() → admin dashboard summary
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_get_preference_stats()
RETURNS TABLE(
  category_id        TEXT,
  category_label     TEXT,
  sort_order         INT,
  opted_in_count     BIGINT,   -- explicit opted-in rows
  opted_out_count    BIGINT,   -- explicit opted-out rows
  total_eligible     BIGINT,   -- contacts with marketing_consent = true
  unsubscribed_total BIGINT    -- contacts with marketing_consent = false
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  WITH eligible AS (
    SELECT COUNT(*) AS n
    FROM   public.crm_contacts
    WHERE  marketing_consent = true
      AND  is_suppressed      = false
  ),
  unsub AS (
    SELECT COUNT(*) AS n
    FROM   public.crm_contacts
    WHERE  marketing_consent = false
  )
  SELECT
    c.id            AS category_id,
    c.label         AS category_label,
    c.sort_order,
    COUNT(p.email) FILTER (WHERE p.opted_in = true)  AS opted_in_count,
    COUNT(p.email) FILTER (WHERE p.opted_in = false) AS opted_out_count,
    (SELECT n FROM eligible)                          AS total_eligible,
    (SELECT n FROM unsub)                             AS unsubscribed_total
  FROM   public.crm_email_preference_categories c
  LEFT   JOIN public.crm_email_preferences p ON p.category_id = c.id
  GROUP  BY c.id, c.label, c.sort_order
  ORDER  BY c.sort_order;
$$;

-- ---------------------------------------------------------------------------
-- 8. crm_apply_email_preferences(p_email, p_prefs, p_unsubscribe_all)
--
-- Called from the email-preference-page Edge Function (service_role key).
-- Updates crm_email_preferences + propagates consent changes to source tables.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_apply_email_preferences(
  p_email           TEXT,
  p_prefs           JSONB,    -- {"marketing": true, "newsletter": false, ...}
  p_unsubscribe_all BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email    TEXT := lower(trim(p_email));
  v_cat      TEXT;
  v_val      BOOLEAN;
  v_any_in   BOOLEAN := false;
BEGIN
  IF p_unsubscribe_all THEN
    -- Opt out of every category
    INSERT INTO public.crm_email_preferences (email, category_id, opted_in, updated_at)
    SELECT v_email, id, false, now()
    FROM   public.crm_email_preference_categories
    ON CONFLICT (email, category_id) DO UPDATE
      SET opted_in = false, updated_at = now();

    -- Propagate to source tables
    UPDATE public.vto_email_leads
    SET    marketing_consent = false
    WHERE  lower(trim(email)) = v_email;

    UPDATE public.newsletter_subscribers
    SET    is_active = false
    WHERE  lower(trim(email)) = v_email;

    RETURN;
  END IF;

  -- Update specific category preferences
  FOR v_cat, v_val IN
    SELECT key, (value::TEXT)::BOOLEAN
    FROM   jsonb_each(p_prefs)
  LOOP
    INSERT INTO public.crm_email_preferences (email, category_id, opted_in, updated_at)
    VALUES (v_email, v_cat, v_val, now())
    ON CONFLICT (email, category_id) DO UPDATE
      SET opted_in = EXCLUDED.opted_in, updated_at = now();

    IF v_val THEN v_any_in := true; END IF;
  END LOOP;

  -- Sync newsletter preference to source table
  IF p_prefs ? 'newsletter' THEN
    UPDATE public.newsletter_subscribers
    SET    is_active = (p_prefs->>'newsletter')::BOOLEAN
    WHERE  lower(trim(email)) = v_email;
  END IF;

  -- Sync marketing_consent: if re-subscribing to anything, re-enable consent
  IF v_any_in THEN
    UPDATE public.vto_email_leads
    SET    marketing_consent = true
    WHERE  lower(trim(email)) = v_email;
  ELSE
    -- All categories turned off
    UPDATE public.vto_email_leads
    SET    marketing_consent = false
    WHERE  lower(trim(email)) = v_email;
  END IF;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.crm_ensure_preference_token(TEXT)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_rotate_preference_token(TEXT)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_get_preference_stats()          TO authenticated;
-- crm_apply_email_preferences is called only by service_role (Edge Function)
GRANT EXECUTE ON FUNCTION public.crm_apply_email_preferences(TEXT, JSONB, BOOLEAN) TO service_role;
