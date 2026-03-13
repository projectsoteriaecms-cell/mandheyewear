

## Activate Interactive Map on Branches Page

### What changes

Replace the static `BranchMapPlaceholder` with a live Google Maps embed that:
- Defaults to the **Head Office** location on page load
- Updates to show the selected branch when a card is clicked (without opening the detail dialog — clicking the card highlights it and pans the map; a separate "View Details" action opens the dialog)
- Shows a pin marker for the selected branch

### Database migration

Add `latitude` and `longitude` columns to the `branches` table, then populate them with the known coordinates for all 5 branches:

| Branch | Latitude | Longitude |
|---|---|---|
| M&H Warri (Head Office) | 5.5168 | 5.7603 |
| M&H Effurun (Delta Mall) | 5.5631 | 5.7938 |
| M&H Lekki Flagship (Talea Mall) | 6.4380 | 3.5315 |
| M&H Lekki (Atlantic Centre) | 6.4350 | 3.5280 |
| M&H Uyo (Tropicana Mall) | 5.0377 | 7.9128 |

```sql
ALTER TABLE public.branches
  ADD COLUMN latitude double precision,
  ADD COLUMN longitude double precision;

UPDATE public.branches SET latitude = 5.5168, longitude = 5.7603 WHERE is_head_office = true;
-- (and similar UPDATEs for each branch by name)
```

### Approach: Google Maps Embed (no API key needed)

Use a Google Maps Embed `<iframe>` with the `place` mode, passing the branch address as a query parameter. This requires **no API key** and works out of the box. If coordinates are available, we use them for precision; otherwise fall back to address string.

### Files to modify

1. **`src/components/branches/BranchMapPlaceholder.tsx`** → Rename/replace with **`BranchMap.tsx`**:
   - Accept `selectedBranch: Branch | null` and `defaultBranch: Branch | null` props
   - Render a Google Maps Embed iframe using the branch address
   - Smooth transition when branch changes
   - Card styling with rounded corners matching current design

2. **`src/pages/Branches.tsx`**:
   - Add a `highlightedBranch` state (separate from `selectedBranch` for dialog)
   - On card click: set `highlightedBranch` (updates map), on double-click or "View Details" button: open dialog
   - Actually simpler: clicking a card updates the map AND opens the dialog. The map always shows whichever branch was last selected. Default to head office.
   - Pass the active branch to `BranchMap`

3. **`src/components/branches/BranchCard.tsx`** — Add visual "active/selected" state styling when the card matches the highlighted branch.

### No API key required

Google Maps Embed API with `place` mode is free and keyless via URL format:
`https://www.google.com/maps/embed/v1/place?key=FREE&q=ADDRESS` — actually this does need a key.

**Alternative**: Use an OpenStreetMap embed via `iframe` which is completely free and keyless:
`https://www.openstreetmap.org/export/embed.html?bbox=...&layer=mapnik&marker=LAT,LNG`

We will use OpenStreetMap to avoid requiring any API keys from the user.

