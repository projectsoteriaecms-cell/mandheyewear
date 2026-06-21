-- Segment evaluation queue — one row per segment (latest job state).
-- Tracks pending/running/succeeded/failed with exponential-backoff retry.

-- Add last_evaluated_at to crm_segments so admins can see staleness.
ALTER TABLE public.crm_segments
  ADD COLUMN IF NOT EXISTS last_evaluated_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.crm_segment_eval_queue (
  segment_id    UUID        PRIMARY KEY
                            REFERENCES public.crm_segments(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'running', 'succeeded', 'failed')),
  attempt_count INT         NOT NULL DEFAULT 0,
  max_attempts  INT         NOT NULL DEFAULT 3,
  last_error    TEXT,
  next_retry_at TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  enqueued_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_segment_eval_queue ENABLE ROW LEVEL SECURITY;

-- Staff and above can read the queue; only service role writes.
CREATE POLICY "admin_read_segment_eval_queue"
  ON public.crm_segment_eval_queue FOR SELECT
  USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- ── crm_enqueue_segment_eval ──────────────────────────────────────────────────
-- Inserts a fresh pending job, or resets an existing job back to pending.
-- Safe to call multiple times — idempotent.
CREATE OR REPLACE FUNCTION public.crm_enqueue_segment_eval(p_segment_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.crm_segment_eval_queue
    (segment_id, status, attempt_count, last_error, next_retry_at, completed_at, enqueued_at, updated_at)
  VALUES
    (p_segment_id, 'pending', 0, NULL, NULL, NULL, now(), now())
  ON CONFLICT (segment_id) DO UPDATE
    SET status        = 'pending',
        attempt_count = 0,
        last_error    = NULL,
        next_retry_at = NULL,
        completed_at  = NULL,
        enqueued_at   = now(),
        updated_at    = now();

  RETURN p_segment_id;
END;
$$;

-- ── crm_claim_segment_eval_job ────────────────────────────────────────────────
-- Atomically claims the next ready pending job → transitions it to 'running'.
-- Returns the claimed row, or empty set if nothing is ready.
CREATE OR REPLACE FUNCTION public.crm_claim_segment_eval_job()
RETURNS SETOF public.crm_segment_eval_queue
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    UPDATE public.crm_segment_eval_queue
    SET    status        = 'running',
           attempt_count = attempt_count + 1,
           updated_at    = now()
    WHERE  segment_id = (
             SELECT segment_id
             FROM   public.crm_segment_eval_queue
             WHERE  status = 'pending'
               AND  (next_retry_at IS NULL OR next_retry_at <= now())
             ORDER  BY enqueued_at
             FOR UPDATE SKIP LOCKED
             LIMIT  1
           )
    RETURNING *;
END;
$$;
