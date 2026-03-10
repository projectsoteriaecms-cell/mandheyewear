

## Enrich Product Metadata via AI Parsing

### Current State
- **3,444** active products total
- **773** already have `style`, `material`, `color` populated (Zoho-synced)
- **2,671** are missing these fields — but their `name` and `description` fields contain parseable info like brand names, model codes, dimensions, and sometimes color hints (e.g. "Charlie Temple Jet Black Ct650", "Cheetah 35K Frame Chad 004 51 23 145")
- **0** products have `description_raw` — the enrichment source is `name` + `description`
- **773** frame_attributes records exist for the enriched products

### Approach
Create a backend function that processes unenriched products in batches, sends them to Lovable AI (gemini-3-flash-preview) with tool calling to extract structured attributes, and writes the results back.

### What the AI will extract per product
| Field | Source signal | Example output |
|-------|-------------|----------------|
| `brand` | Name parsing ("Chanel 40K Frame...") | "Chanel" |
| `style` | AI inference from model code + brand | "Rectangular" |
| `material` | AI inference from brand knowledge | "Acetate" |
| `color` | Name parsing ("Jet Black", color codes) | "Black" |
| `gender` | AI inference from brand/name context | "unisex" |

The AI uses tool calling to return structured JSON, matching the existing vocabulary (Rectangular, Cat Eye, Aviator, Acetate, Metal, Titanium, etc.).

### Implementation

**1. Edge function: `supabase/functions/enrich-products/index.ts`**
- Accepts `{ batchSize?: number, dryRun?: boolean }`
- Queries products where `style IS NULL AND item_type = 'frames'` (frames first, ~2,200 products)
- Processes in batches of 20 products per AI call (to stay within token limits)
- Uses Lovable AI with tool calling to extract structured attributes
- Updates products table with extracted values
- Returns summary of enriched count + failures
- Protected: requires authenticated admin/super_admin

**2. Admin UI trigger: `src/pages/admin/Products.tsx`**
- Add an "Enrich Metadata" button that calls the edge function
- Shows progress toast/indicator
- Displays results summary when complete

**3. Database**: No schema changes needed — all target columns (`style`, `material`, `color`, `brand`, `gender`) already exist on the `products` table.

### Processing strategy
- ~2,200 unenriched frames, 20 per AI call = ~110 API calls
- Add 500ms delay between calls to avoid rate limiting
- Total estimated time: ~2-3 minutes for full catalog
- Edge function processes up to 100 products per invocation (5 AI calls), returns cursor for next batch
- Admin UI calls repeatedly until all products are enriched

### Safety
- Only updates NULL fields — never overwrites existing enriched data
- `dryRun` mode available to preview without writing
- All updates logged with count of changes

