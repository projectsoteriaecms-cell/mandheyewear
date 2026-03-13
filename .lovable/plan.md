

## Redesign Branches Page: Card Grid Layout

### What changes

The current Branches page uses a vertical stacked list with detailed cards (address, phone, email, hours, features, action buttons). Inspired by the reference image, we will redesign it to use a **3-column card grid** where each branch is a compact, visually appealing card with:

- A dark overlay background (since we don't have store photos, we'll use a branded gradient/pattern)
- Branch name prominently centered
- Address below the name
- The M&H logo/icon at the bottom
- Hover effect to reveal action buttons (Call, Directions)
- Head Office / Flagship badges preserved

### Layout change

```text
Current:                          New:
┌─────────────────────────┐      ┌──────┐ ┌──────┐ ┌──────┐
│ Branch 1 (full-width)   │      │Card 1│ │Card 2│ │Card 3│
├─────────────────────────┤  →   └──────┘ └──────┘ └──────┘
│ Branch 2 (full-width)   │      ┌──────┐ ┌──────┐ ┌──────┐
├─────────────────────────┤      │Card 4│ │Card 5│ │Card 6│
│ Branch 3 (full-width)   │      └──────┘ └──────┘ └──────┘
└─────────────────────────┘
```

### Files to modify

1. **`src/components/branches/BranchCard.tsx`** — Complete redesign:
   - Replace the detailed horizontal card with a compact visual card
   - Dark gradient background with subtle pattern
   - Centered branch name (bold, white)
   - Address text below (white/light)
   - MapPin icon at the bottom center (primary color)
   - Badges (Head Office, Flagship) as small overlays
   - On hover: slight scale-up, show "View Details" or action overlay
   - Clicking the card could link to a detail view or open a dialog with the full info (phone, email, hours, features, buttons)

2. **`src/pages/Branches.tsx`** — Update the grid layout:
   - Change from `space-y-6` (vertical stack) to `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
   - Update skeleton loaders to match the new card shape (aspect-ratio cards)
   - Keep BranchMapPlaceholder and BranchExpansionCTA below

3. **New: `src/components/branches/BranchDetailDialog.tsx`** — Dialog for full branch info:
   - Opens when a card is clicked
   - Shows full details: address, phone, email, hours, features
   - Action buttons: Call, Get Directions, Book Appointment / Shop Eyewear
   - Reuses the existing detailed content from the old BranchCard

### Technical details

- No database changes needed
- Branch type already has all fields (name, address, city, state, phone, email, hours, features, is_head_office, is_mh_location)
- Uses existing Radix Dialog component for the detail view
- Responsive: 1 column on mobile, 2 on tablet, 3 on desktop
- Cards will use `aspect-[4/3]` for consistent proportions
- Dark background with CSS gradient since no store images exist in the database schema

