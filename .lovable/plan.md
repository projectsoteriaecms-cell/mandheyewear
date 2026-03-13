

## Face Measurement Feature — What It Is and The Plan

### What It Does
The face measurement feature uses AI vision (via Lovable AI gateway) to analyze a user's photo and extract facial dimensions:
- **Face width** (mm)
- **Pupillary distance** (mm)  
- **Bridge width** (mm)
- **Temple width** (mm)
- **Face shape** (oval, round, square, heart, oblong)

These measurements are saved to the user's profile and power **fit indicators** on product cards — showing labels like "Good fit", "Too narrow", or "Perfect match" based on how a frame's dimensions compare to the user's face.

### Current State
- The `analyze-face` edge function and `useFaceMeasurement` hook are fully built and deployed
- The `FaceScanStep` UI component exists with camera capture, photo upload, analysis progress, results display, and error/retry handling
- **Problem**: It's not rendered anywhere. It was removed from onboarding (correctly — per the 3-step redesign) but never placed elsewhere

### The Plan
Add it to **two places**:

**1. Dashboard → Frame Profile tab**
- Add a "Scan Your Face" button (or "Retake" if measurements exist)
- Opens a dialog containing the existing `FaceScanStep`
- On success, refreshes the profile to show updated measurements
- This is the primary, intentional entry point

**2. Product Detail Page (future)**
- Show a subtle prompt like "Get your fit score — scan your face" if the user has no measurements
- Links to the same scan flow
- This drives adoption at the moment of highest relevance (when browsing frames)

### Files Involved
- **Create**: `src/components/dashboard/FaceScanDialog.tsx` — dialog wrapper
- **Modify**: `src/components/dashboard/FrameProfileSection.tsx` — add scan button
- **Reuse as-is**: `FaceScanStep.tsx`, `useFaceMeasurement.ts`, `analyze-face` edge function

### Why It Matters
Without face measurements, the fit indicators on product cards can't work — every frame shows as "Unknown fit." This feature closes that gap by giving users an easy, optional way to get measured.

