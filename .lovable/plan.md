

## Add Tooltips to All Icon-Only Buttons

### Problem
Icon-only buttons (dark/light mode toggle, search, wishlist, cart, notifications, etc.) have no visible labels, making them hard to identify for users unfamiliar with the icons.

### Solution
Wrap every icon-only `<Button size="icon">` across the storefront and admin layouts with the existing `<Tooltip>` component from `@/components/ui/tooltip`, providing descriptive labels on hover.

### Files to Update

**1. `src/components/navigation/TopBar.tsx`** — Desktop top bar
- Theme toggle button: tooltip "Switch to dark/light mode"

**2. `src/components/navigation/MainNav.tsx`** — Desktop main nav
- Search button: "Search"
- Wishlist button: "Wishlist"
- Account button: "My Account"

**3. `src/components/navigation/MobileTopBar.tsx`** — Mobile top bar
- Menu button: "Menu"
- Theme toggle: "Toggle theme"
- Wishlist button: "Wishlist"
- Cart/bag button: "Cart"

**4. `src/components/cart/CartDrawer.tsx`** — Cart trigger
- Cart bag icon: "Cart"

**5. `src/shared/layouts/admin/AdminHeader.tsx`** — Admin header
- Notifications bell: "Notifications"
- Store link icon: "Go to Store"

**6. `src/modules/storefront/components/eyewear/ProductCard.tsx`** — Product card hover actions
- Virtual Try-On button: "Virtual Try-On"
- Add to Cart button: "Add to Cart"

**7. `src/modules/storefront/components/eyewear/ProductListCard.tsx`** — Product list card actions
- Same tooltips as ProductCard

### Implementation Pattern
Each icon button gets wrapped like this:
```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" ...>
        <Icon />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Label text</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

A single `<TooltipProvider>` will wrap groups of icon buttons where multiple appear together, to avoid nesting multiple providers.

