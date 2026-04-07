

## Reorganize Dashboard Stock Units into Three Clear Sections

### What changes

The dashboard currently shows M&H and Central stats mixed with other metrics (featured online, images, sourcing, etc.). You want three distinct, clearly labeled sections for stock units:

1. **M&H E-Commerce** — M&H stock units, product count, low stock, out of stock
2. **Soteria / Other Branches** — Soteria stock units, product count, branch count, available for sourcing
3. **Total (All Branches)** — Combined stock units, total products, active suppliers, overall low stock

### File changes

**`src/pages/admin/Dashboard.tsx`** — Restructure the stat cards grid into three visually separated sections:

- **Section 1: M&H E-Commerce** — Keep the existing M&H section but focus it on: M&H Stock Units, M&H Products, Featured Online/With Images, Low Stock (M&H), Out of Stock (M&H)
- **Section 2: Soteria / Other Branches** — Rename "Central / Other Branches" to "Soteria Medical". Show: Soteria Stock Units, Soteria Products, Branches, Available for Sourcing
- **Section 3: Combined Totals** — Relabel the existing combined row with a proper `SectionHeader` (icon + title). Show: Total Stock (All), Total Products (All), Active Suppliers, and a summary low-stock or out-of-stock card

No backend/database changes needed — all data is already available in `useInventoryStats()`. This is purely a UI reorganization of the existing Dashboard.tsx layout.

### Technical detail

- Add a third `SectionHeader` for the "Combined Totals" row (currently it's just a grid with no header)
- Change the "Central / Other Branches" label/description to reference "Soteria Medical" for clarity
- All stat values already exist in `stats.mh.*`, `stats.central.*`, and `stats.totalItems` / `stats.totalProductCount`

