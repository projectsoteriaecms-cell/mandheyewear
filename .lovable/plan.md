# Schema additions for products & frame_attributes

Add the columns you provided to the database so future product copy, fit data, and Rx-compatibility info can be stored.

## Migration

```sql
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tagline text;

ALTER TABLE public.frame_attributes
  ADD COLUMN IF NOT EXISTS lens_height            integer,
  ADD COLUMN IF NOT EXISTS total_width            integer,
  ADD COLUMN IF NOT EXISTS pd_range_min           integer,
  ADD COLUMN IF NOT EXISTS pd_range_max           integer,
  ADD COLUMN IF NOT EXISTS rx_sph_min             numeric(5,2),
  ADD COLUMN IF NOT EXISTS rx_sph_max             numeric(5,2),
  ADD COLUMN IF NOT EXISTS progressive_compatible boolean,
  ADD COLUMN IF NOT EXISTS size_label             text,
  ADD COLUMN IF NOT EXISTS best_for_faces         text,
  ADD COLUMN IF NOT EXISTS best_for_occasions     text;
```

## Notes

- All columns are nullable with no default — safe additive change, no impact on existing rows or queries.
- RLS policies on both tables already cover these new columns (policies are row-level, not column-level).
- After migration runs, `src/integrations/supabase/types.ts` regenerates automatically, so TypeScript will recognize the new fields immediately.
- No frontend code changes in this step. UI surfaces (PDP spec block, admin product editor, fit-finder) can be wired up afterward — let me know which ones you want first.

## Open question (optional)

`best_for_faces` and `best_for_occasions` are stored as `text`. If you'd rather store multiple values per frame (e.g. "round, oval, heart"), I can switch them to `text[]` arrays instead — say the word before approving.
