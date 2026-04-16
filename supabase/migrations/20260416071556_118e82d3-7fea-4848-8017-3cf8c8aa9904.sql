
-- Enable extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule abandoned cart recovery every 15 minutes
SELECT cron.schedule(
  'recover-abandoned-carts',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ispizamxlrukxmysgyjv.supabase.co/functions/v1/recover-abandoned-carts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcGl6YW14bHJ1a3hteXNneWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzOTE0NzAsImV4cCI6MjA4NDk2NzQ3MH0.ZPtt0W7kndFLZKCUn2o90p4MxzLzWZdmESwPRhY9Q7o"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule browse abandonment nudge every 30 minutes
SELECT cron.schedule(
  'browse-abandonment-nudge',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ispizamxlrukxmysgyjv.supabase.co/functions/v1/browse-abandonment-nudge',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcGl6YW14bHJ1a3hteXNneWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzOTE0NzAsImV4cCI6MjA4NDk2NzQ3MH0.ZPtt0W7kndFLZKCUn2o90p4MxzLzWZdmESwPRhY9Q7o"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
