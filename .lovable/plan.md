
# Seamless Navigation: Admin to Storefront

## Current Problem

When you enter the ECMS Admin panel, there's no obvious way to get back to the main store/home:

1. **Desktop**: The "Back to Store" link exists but it's tucked at the very bottom of the sidebar - easy to miss
2. **Mobile**: The sidebar is completely hidden (fixed `w-64` with no responsive handling), leaving **zero navigation options** to return

## Solution

Add a prominent, accessible "Back to Store" action in **two strategic locations**:

### 1. Admin Header (Always Visible)
Add a clear "Back to Store" or Home icon button in the header next to the title - this will be visible on both desktop and mobile.

### 2. Mobile Hamburger Menu for Admin
Create a collapsible mobile menu that slides in (like the storefront MobileNav), providing access to admin navigation AND the "Back to Store" link.

---

## Implementation Details

### File: `src/shared/components/admin/AdminHeader.tsx`

**Changes:**
- Add a "Store" or "Home" button on the left side of the header
- Import necessary icons (`Storefront` or `House` from Phosphor)
- Make it visually distinct but not intrusive

```tsx
// In the header's left section
<div className="flex items-center gap-4">
  <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
    <Storefront weight="light" className="h-5 w-5" />
    <span className="hidden sm:inline text-sm">Store</span>
  </Link>
  <span className="text-border">|</span>
  <h2 className="text-lg font-semibold">Inventory Management</h2>
</div>
```

### File: `src/shared/components/admin/AdminLayout.tsx`

**Changes:**
- Hide sidebar on mobile with `hidden md:flex`
- Add mobile hamburger trigger in header area

### File: `src/shared/components/admin/AdminMobileNav.tsx` (New)

**Create a mobile navigation drawer for admin** that includes:
- All admin navigation items
- Prominent "Back to Store" link
- Current user info

### File: `src/shared/components/admin/AdminHeader.tsx`

**Additional Changes:**
- Add hamburger menu button (visible on mobile only)
- Import and use the new AdminMobileNav component

---

## Visual Hierarchy

| Location | Desktop | Mobile |
|----------|---------|--------|
| Header | "Store" link + title | Hamburger + "Store" icon + title |
| Sidebar | Full nav + bottom "Back to Store" | Hidden (use mobile drawer) |
| Mobile Drawer | N/A | Full admin nav + "Back to Store" |

---

## Files to Modify

1. **`src/shared/components/admin/AdminHeader.tsx`**
   - Add "Store" button/link on left side
   - Add mobile hamburger trigger

2. **`src/shared/components/admin/AdminLayout.tsx`**
   - Make sidebar responsive (`hidden md:flex`)

3. **`src/shared/components/admin/AdminMobileNav.tsx`** (New)
   - Create mobile navigation drawer for admin

4. **`src/shared/components/admin/index.ts`**
   - Export the new AdminMobileNav component

## Result

- **Desktop**: Clear "Store" link in header + sidebar bottom link
- **Mobile**: Hamburger menu with full navigation + prominent "Back to Store"
- **Seamless flow**: Easy to switch between admin and storefront from anywhere
