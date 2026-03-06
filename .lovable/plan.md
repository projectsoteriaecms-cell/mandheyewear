

## Optimize Zoho Sync for Large Catalogs

### Problem
The `zoho-sync` edge function processes all 1,400+ items in a single invocation, hitting the 60-second timeout. Items upsert one-by-one, and the sync log never gets updated to "success."

### Solution: Paginated batch approach with self-chaining

The edge function will process one page at a time (200 items) per invocation. After completing a page, if there are more pages, it invokes itself for the next page. This keeps each invocation well under the timeout. Batch upserts (instead of one-by-one) further reduce time per page.

### Changes

**1. Edge function `supabase/functions/zoho-sync/index.ts`**

- Add `page` and `sync_id` parameters to `pull_items` action body
- First call (no `page`): creates sync log, processes page 1, then self-invokes for page 2
- Subsequent calls (with `page` + `sync_id`): skip auth re-verification (use service key internally), process that page, chain to next
- Batch upsert: instead of upserting items one-by-one, upsert all 200 items in a single `.upsert()` call per page
- After processing the last page (no more pages), update sync log to "success"/"error" with final counts
- Store running totals in the sync log `metadata` field so each page can increment counts

Key logic:
```text
Client calls: { action: "pull_items" }
  → creates sync_log, gets token, processes page 1
  → updates sync_log metadata with running totals  
  → if hasMore: self-invokes with { action: "pull_items_continue", page: 2, sync_id, access_token }
  → if !hasMore: finalizes sync_log as complete

Self-invoke: { action: "pull_items_continue", page: N, sync_id, access_token }
  → processes page N with batch upsert
  → updates sync_log metadata  
  → chains to page N+1 or finalizes
```

**2. Hook `src/hooks/admin/useZohoSync.ts`**

- The first invocation now returns quickly (after page 1), so update the hook to:
  - Show "Sync started" and switch to a polling state
  - Poll `zoho_sync_log` every 3 seconds until status changes from "pending" to "success"/"error"
  - Display final counts from the log when complete
  - Remove the timeout-guessing logic (no longer needed)

**3. Sync History Panel `src/components/admin/products/ZohoSyncHistoryPanel.tsx`**

- Add "success" case to `statusBadge` (currently only handles "completed")
- Show in-progress indicator when status is "pending" with a records count from metadata
- Auto-refetch every 5 seconds when any log is in "pending" state

### Technical Details

- Self-invocation uses `fetch()` to the function's own URL with the service role key, so no user auth needed for chained calls
- Each page processes ~200 items in a single batch upsert (~1-2 seconds)
- Running totals stored in `metadata: { total_processed, total_failed, current_page }`
- The `zoho_sync_log` UPDATE RLS policy needs to be added (currently missing — the edge function uses the service role key so this works, but the metadata updates rely on the service client)

