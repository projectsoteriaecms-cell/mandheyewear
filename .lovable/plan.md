

## Fix Double X Icon and Enlarge Logo in Mobile Menu

### Problems
1. **Two X icons**: The `SheetContent` component renders a default close button (top-right X), AND the hamburger menu header has a custom `SheetClose` X button. Both are visible.
2. **Tiny logo**: The M&H logo in the sheet header uses `h-8` (32px), which is too small.

### Changes

**File: `src/components/navigation/MobileTopBar.tsx`**

- Add `hideCloseButton` prop to `SheetContent` to suppress the built-in X (the component already supports this prop)
- Keep the custom X button in the header (it's styled to match the primary background)
- Increase logo from `h-8` to `h-12` for better visibility

Two small edits in the same file, no other files affected.

