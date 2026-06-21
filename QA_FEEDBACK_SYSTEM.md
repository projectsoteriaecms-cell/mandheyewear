# M&H Eyewear: QA & Feedback Loop System

## Overview

A 3-part system that captures user feedback, runs periodic audits, and automatically identifies issues:

1. **Feedback Collection** — error logs, user feedback, analytics
2. **QA Audit Suite** — hourly/daily health checks
3. **Auto-Fix Loop** — suggest and track fixes

---

## Part 1: Setup (One-time)

### Step 1a: Create Feedback Tables in Supabase

Go to **Supabase Dashboard** → Project `znhrwzxthusqtqreawwq` → SQL Editor:

Copy and paste the entire SQL from `supabase/migrations/20260609_feedback_audit_system.sql` and execute.

Tables created:
- `error_logs` — capture platform errors
- `user_feedback` — explicit user reports
- `analytics_events` — page views, product interactions
- `qa_audit_results` — periodic audit results
- `suggested_fixes` — auto-generated recommendations

### Step 1b: Add JavaScript Error Tracking to Frontend

In `src/main.tsx`, add this window error handler:

```typescript
// Global error logger
window.onerror = (msg, url, line, col, error) => {
  fetch('/api/error-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error_type: 'frontend',
      message: msg,
      stack_trace: error?.stack,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      severity: 'error',
    }),
  }).catch(() => {});  // silent fail
};

// Log unhandled promise rejections
window.onunhandledrejection = (event) => {
  fetch('/api/error-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error_type: 'frontend',
      message: event.reason?.message || String(event.reason),
      severity: 'warning',
      page_url: window.location.href,
    }),
  }).catch(() => {});
};
```

### Step 1c: Add Feedback Form to Admin Panel

Create a new admin page `src/pages/admin/Feedback.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setFeedback(data));
  }, []);

  return (
    <div>
      <h1>User Feedback</h1>
      {feedback.map(f => (
        <div key={f.id} className="border p-4 mb-4">
          <h3>{f.title}</h3>
          <p>{f.message}</p>
          <span className="text-sm text-gray-500">
            {f.feedback_type} • {f.severity}
          </span>
        </div>
      ))}
    </div>
  );
}
```

---

## Part 2: Run Audits (Automated)

### Option A: Manual (Test First)

```bash
# Test audit script
python qa_audit_suite.py --quick

# Full audit
python qa_audit_suite.py --full

# Specific checks
python qa_audit_suite.py --link-check
python qa_audit_suite.py --auth-flow
```

### Option B: Vercel Cron (Recommended)

Create `api/cron/qa-audit.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: NextRequest) {
  // Verify cron secret
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Run audit
  const result = await runAudit();
  return NextResponse.json(result);
}

async function runAudit() {
  return new Promise((resolve) => {
    exec('python qa_audit_suite.py --full', (error, stdout, stderr) => {
      resolve({
        success: !error,
        output: stdout,
        error: stderr,
        timestamp: new Date().toISOString(),
      });
    });
  });
}
```

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/qa-audit",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Schedule options:**
- `0 * * * *` — every hour
- `0 2 * * *` — daily at 2 AM UTC
- `0 2 * * MON` — every Monday

### Option C: GitHub Actions (CI/CD Integration)

Create `.github/workflows/qa-audit.yml`:

```yaml
name: QA Audit

on:
  schedule:
    - cron: '0 2 * * *'  # Daily 2 AM UTC
  workflow_dispatch:      # Manual trigger

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: python qa_audit_suite.py --full
```

---

## Part 3: Feedback Loop (The Routine)

### Weekly Review Routine

Every Monday at 10 AM, check:

1. **Error Logs** — admin page `/admin/system-logs`
   - Any critical errors? → File issue
   - Pattern of similar errors? → Fix root cause

2. **User Feedback** — admin page `/admin/feedback`
   - Feature requests? → Add to product backlog
   - Complaints? → Prioritize fix

3. **QA Audit Results** — admin page `/admin/qa-results`
   - Failed checks? → Investigate
   - Performance degradation? → Optimize
   - Security warnings? → Patch immediately

4. **Suggested Fixes** — admin page `/admin/suggested-fixes`
   - Review auto-generated recommendations
   - Mark as "implemented" when done
   - Dismiss if not actionable

### Auto-Fix Examples (Optional Future)

```python
# Examples of auto-fixable issues:
- Dead image URL → Rewrite to new storage path
- Missing product description → Fall back to SKU
- Expired API key → Rotate and restart service
- Slow endpoint → Add caching header
```

---

## Part 4: Create as Skill (Advanced)

### Convert to Claude Code Skill

1. Create `~/.claude/skills/qa-audit/SKILL.md`:

```markdown
# QA Audit Skill

Runs comprehensive quality assurance checks on M&H Eyewear platform.

## Usage

/qa-audit [--quick | --full | --link-check | --auth-flow]

- `--quick` — critical checks only (5 min)
- `--full` — all checks (15 min)
- `--link-check` — test all product images
- `--auth-flow` — test signup/login

## Output

Results logged to Supabase `qa_audit_results` table.

Generates entries in `suggested_fixes` for any failures.
```

2. Make it executable:

```bash
chmod +x ~/.claude/skills/qa-audit/index.sh
```

3. In Claude Code, invoke as `/qa-audit --full`

### Schedule the Skill

In `.claude.json`:

```json
{
  "crons": [
    {
      "skill": "qa-audit",
      "args": "--full",
      "schedule": "0 2 * * *",
      "name": "Daily QA Audit"
    }
  ]
}
```

---

## Observing User Activity

### What We Can Track Now

1. **Sign-ups & Auth**
   - Query `auth.users` for signup rate
   - Track failed login attempts (via error_logs)

2. **Product Browsing**
   - Which products viewed most? (analytics_events)
   - Search queries used?
   - Filters applied?

3. **Checkout Flow**
   - Where do users abandon? (cart_items table)
   - Common errors at checkout?

4. **Performance**
   - API response times (qa_audit_results)
   - Page load times (analytics_events)

5. **Errors**
   - Most common errors (error_logs)
   - Which pages crash?
   - Auth failures?

### Example: Weekly Analytics Report

```sql
-- Most viewed products
SELECT product_id, COUNT(*) as views
FROM analytics_events
WHERE event_type = 'product_view'
  AND created_at > now() - interval '7 days'
GROUP BY product_id
ORDER BY views DESC
LIMIT 10;

-- Error summary
SELECT error_type, severity, COUNT(*) as count
FROM error_logs
WHERE created_at > now() - interval '7 days'
GROUP BY error_type, severity
ORDER BY count DESC;

-- Checkout funnel
SELECT 
  COUNT(CASE WHEN event_type = 'checkout_start' THEN 1 END) as started,
  COUNT(CASE WHEN event_type = 'checkout_complete' THEN 1 END) as completed,
  ROUND(100 * COUNT(CASE WHEN event_type = 'checkout_complete' THEN 1 END)::numeric 
    / COUNT(CASE WHEN event_type = 'checkout_start' THEN 1 END), 2) as conversion_rate
FROM analytics_events
WHERE created_at > now() - interval '7 days';
```

---

## Next Steps

1. ✅ **Now**: Set up feedback tables in Supabase dashboard
2. ✅ **Today**: Run `python qa_audit_suite.py --quick` to test
3. ✅ **This week**: Add Vercel cron or GitHub Actions schedule
4. ✅ **Next week**: Review results, prioritize fixes, update code
5. ✅ **Ongoing**: Weekly review → monthly retrospective

---

## Files Created

- `qa_audit_suite.py` — the audit engine
- `supabase/migrations/20260609_feedback_audit_system.sql` — database schema
- This document — setup guide

## Results Dashboard

All results live in Supabase. Query directly or create admin pages for:

- Error Trends (error_logs)
- User Satisfaction (user_feedback)
- Feature Usage (analytics_events)
- Platform Health (qa_audit_results)
- Fix Tracking (suggested_fixes)
