

## Fix Editorial Grid — Remove Empty White Space

### Problem
Block 02 ("Sharper Style") uses `row-span-2`, making it twice the height. In a 3-column grid with 6 items, this creates an uneven layout with empty cells in the last row.

### Solution — `EditorialGrid.tsx`

1. **Remove `large` property and `row-span-2`** from block 02 — make all 6 cards the same size
2. **Remove the `span` property** from all blocks (unused except for the `large` flag logic)
3. **Remove the `large` conditional** in the card rendering (line 47) so all cards get the same `min-h-[220px] sm:min-h-[260px]`

Result: a clean **3×2 grid on desktop**, **2×3 on tablet**, **6×1 on mobile** — no empty white space anywhere.

