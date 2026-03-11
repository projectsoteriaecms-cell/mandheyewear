

## Improvements for Generate Missing Images

After reviewing the current implementation, here are the key areas that could be improved:

### 1. Live Progress Log (Currently Processing Product)
Right now the running state only shows counts. Add a **live ticker** showing the current product being processed (name, SKU, brand) so the admin knows exactly what's happening and can spot issues early.

### 2. Cost/Credit Estimation
Show an **estimated API cost** in the summary before starting. Frames use 6 API calls each, non-frames use 1. Display something like "~312 API calls" so the admin can make informed decisions about batch sizes.

### 3. Brand-Level Filtering
Currently filtering is only by `item_type`. Add a **secondary brand filter** so the admin can generate images for a specific brand (e.g., "Generate all missing Gucci frames first"). This is especially useful for the 1,800+ frames category.

### 4. Priority Queue with Skip-on-Fail
Currently if a product fails, it retries 3 times then moves on. Add a **"skip threshold"** — if X consecutive products fail (e.g., 5 in a row), auto-pause and surface a warning rather than burning through API credits on likely-systemic failures.

### 5. Downloadable Error Report
After completion, allow the admin to **export failed items as CSV** (SKU, name, error reason) so they can investigate and fix data issues before retrying.

### 6. Resume Capability
Track which products were already processed in the current session. If the admin cancels and reopens, show a **"Resume from where you left off"** option instead of restarting from scratch.

### 7. Preview Before Commit
For single-product regeneration, show a **preview of the generated image** before saving it to the database. This prevents bad generations from overwriting good manual uploads.

---

### Recommended Priority (highest impact first)

I'd suggest implementing **items 1, 4, and 5** first — they address the biggest pain points: visibility during long runs, preventing wasted API calls, and actionable error reporting.

### Technical Changes

**GenerateImagesDialog.tsx:**
- Add `currentProduct` state to display live SKU/name during generation
- Add consecutive failure counter + auto-pause logic
- Add "Export Errors" button in the done/cancelled state
- Edge function response already includes SKU — just surface it in the UI

**Edge function (minor):**
- Return the current product name/brand in the batch response so the dialog can show it
- Add a `skipThreshold` parameter to auto-stop after N consecutive failures

**ProductImages.tsx:**
- Add brand filter dropdown alongside the item type selection in the generate dialog
- Pass brand list to GenerateImagesDialog

