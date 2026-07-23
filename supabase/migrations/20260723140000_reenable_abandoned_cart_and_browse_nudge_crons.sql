-- The original schedule (20260416071556) pointed at a stale project ref
-- (ispizamxlrukxmysgyjv) with a hardcoded anon JWT for that old project --
-- dead ever since a project migration, and never re-scheduled against the
-- current project (znhrwzxthusqtqreawwq). Both target functions already
-- have verify_jwt = false live, so no auth header is required at the
-- gateway; X-Cron-Secret is sent anyway to match the platform-health-check
-- / fire-scheduled-triggers pattern for consistency, though these two
-- functions don't currently check it themselves.

SELECT cron.schedule(
  'recover-abandoned-carts',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://znhrwzxthusqtqreawwq.supabase.co/functions/v1/recover-abandoned-carts',
    headers := '{"Content-Type": "application/json", "X-Cron-Secret": "78114c155f6c303895c2e559644f3f41b9749d76803fed357cff6a95aa4676b3"}'::jsonb,
    body    := '{}'::jsonb
  ) AS request_id
  $$
);

SELECT cron.schedule(
  'browse-abandonment-nudge',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://znhrwzxthusqtqreawwq.supabase.co/functions/v1/browse-abandonment-nudge',
    headers := '{"Content-Type": "application/json", "X-Cron-Secret": "78114c155f6c303895c2e559644f3f41b9749d76803fed357cff6a95aa4676b3"}'::jsonb,
    body    := '{}'::jsonb
  ) AS request_id
  $$
);
