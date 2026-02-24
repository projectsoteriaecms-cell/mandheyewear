

# Make the Delivery Report Accessible from the Admin Panel

## The Problem
The Platform Delivery Report page exists at `/admin/delivery-report`, but there's no way to navigate to it from the admin dashboard -- no sidebar link, no button, nothing visible.

## What Will Change

### 1. Add a "Delivery Report" link to the admin sidebar
- Add a new nav item under the existing "Reports" section in the sidebar navigation config
- Restricted to Super Admin only (using `requiresSuperAdmin: true`)
- Uses a document/file icon (e.g. `FileText` from Phosphor Icons)

### 2. Add a quick-access button on the Admin Dashboard
- Add a prominent card or button on the dashboard home page for Super Admins
- Label: "Platform Delivery Report" with a brief description and a "View & Download" action
- This gives immediate visibility so you don't have to hunt through menus

### File Changes
- `src/shared/components/admin/sidebar/nav-config.ts` -- Add "Delivery Report" nav item with `requiresSuperAdmin: true`
- `src/pages/admin/Dashboard.tsx` -- Add a quick-access card for the delivery report (visible to Super Admin only)

### Technical Details
- Import `FileText` (or `File`) icon from `@phosphor-icons/react` in the nav config
- Add the nav item after "Reports" in the sidebar array
- On the dashboard, add a card below the Quick Actions section that links to `/admin/delivery-report` with a download icon and description
- The existing `DeliveryReport.tsx` page and route remain unchanged -- it already has the "Download as PDF" button and print-optimized styling

