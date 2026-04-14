

# Fix Unclickable Account Icon in Desktop Navigation

## Problem
The User/Account icon in the desktop navigation bar (`MainNav.tsx`, lines 152-162) nests a `Tooltip > TooltipTrigger > Button` inside a `DropdownMenuTrigger`. Both Radix primitives (`Tooltip` and `DropdownMenu`) compete for pointer events on the same element, causing the click to be swallowed — the dropdown never opens.

This means authenticated users on desktop cannot:
- Access the Admin Panel link
- Sign out
- Navigate to their account

## Fix
Remove the `Tooltip` wrapper from around the dropdown trigger button. The dropdown itself makes it clear what the icon does once clicked — the tooltip is unnecessary here.

### File: `src/components/navigation/MainNav.tsx`

**Before** (lines 153-163):
```tsx
<DropdownMenuTrigger asChild>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" className="...">
        <User weight="light" className="h-5 w-5" />
      </Button>
    </TooltipTrigger>
    <TooltipContent><p>My Account</p></TooltipContent>
  </Tooltip>
</DropdownMenuTrigger>
```

**After**:
```tsx
<DropdownMenuTrigger asChild>
  <Button variant="ghost" size="icon" className="..." aria-label="My Account">
    <User weight="light" className="h-5 w-5" />
  </Button>
</DropdownMenuTrigger>
```

That's it — one file, one change, removes the conflicting Tooltip wrapper and restores click functionality.

## What Stays the Same
- All dropdown menu items (My Account, Admin Panel, Sign Out)
- Mobile navigation (no tooltip nesting issue there)
- All auth logic, role checking, and routing

