
# Navigation Restructure & Virtual Try-On Onboarding Guide

## Overview

This plan addresses three key improvements:
1. **Eyewear Dropdown** - Combine Eyeglasses and Sunglasses under a single "Eyewear" dropdown menu
2. **Virtual Try-On in Navigation** - Add Virtual Try-On as a highlighted feature next to Style Quiz
3. **Try-On Page Guided Tour** - Add an interactive onboarding system to help users understand the VTO flow

---

## 1. Eyewear Dropdown Menu

### Current State
```text
[ Style Quiz ] [ Eyeglasses ] [ Sunglasses ] [ Eye Exams ] [ Accessories ]
```

### New State
```text
[ Style Quiz ] [ Virtual Try-On ] [ Eyewear ▼ ] [ Eye Exams ] [ Accessories ]
                                       │
                                       ├── Eyeglasses
                                       ├── Sunglasses
                                       └── All Eyewear
```

### Changes to MainNav.tsx
- Remove individual Eyeglasses/Sunglasses links from `navLinks` array
- Add a new "Eyewear" item with dropdown menu
- Add "Virtual Try-On" as a highlighted link beside Style Quiz
- Use existing `DropdownMenu` component from Radix UI (already in use for account menu)

---

## 2. Virtual Try-On Navigation Placement

### Desktop (MainNav)
- Add Virtual Try-On link after Style Quiz
- Use highlight styling with icon (Camera/CameraRotate icon from Phosphor)
- Links to `/try-on`

### Mobile (MobileTopBar + MobileBottomNav)
- Add Virtual Try-On to the hamburger menu with highlight styling
- Optionally add to bottom navigation bar (replacing Search if needed, or as 6th item)

---

## 3. Try-On Page Guided Onboarding

### Approach: Step-by-Step Tooltip Tour

A lightweight onboarding system that guides first-time users through the VTO flow. Uses tooltips that appear sequentially, pointing to each key element.

### Tour Steps
```text
Step 1: "Upload Your Photo"
   → Highlights PhotoUpload area
   → "Start by uploading a clear, front-facing photo"

Step 2: "Browse Our Frames"  
   → Highlights FramePicker carousel
   → "Scroll through 70+ frames or use filters to find your style"

Step 3: "Try It On"
   → Highlights a frame's "Try This Frame" button
   → "Click to see the frame on your face using AI"

Step 4: "View Your Result"
   → Highlights TryOnResult area
   → "See the realistic preview - add to cart or try another!"

Step 5: "Save to History"
   → Highlights TryOnHistory
   → "Your try-ons are saved here for easy comparison"
```

### Technical Implementation

**New Component: TryOnTour.tsx**
- Manages tour state (current step, visibility)
- Uses localStorage to track if user has completed tour
- Positions spotlight/tooltip over each element
- "Next" / "Skip" / "Finish" controls

**Styling Approach**
- Semi-transparent overlay to dim page
- Spotlight cutout around active element
- Animated tooltip with arrow pointing to element
- Progress dots showing current step

**State Management**
- `hasSeenTour` stored in localStorage
- Tour auto-starts on first visit
- "?" button in header to restart tour anytime

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/components/try-on/TryOnTour.tsx` | Main tour controller component |
| `src/components/try-on/TourStep.tsx` | Individual tooltip/spotlight step |
| `src/hooks/useTryOnTour.ts` | Tour state management hook |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/navigation/MainNav.tsx` | Add Eyewear dropdown, add Virtual Try-On link |
| `src/components/navigation/MobileTopBar.tsx` | Add Virtual Try-On to menu |
| `src/components/navigation/MobileNav.tsx` | Add Virtual Try-On to menu |
| `src/components/navigation/MobileBottomNav.tsx` | Consider adding VTO icon |
| `src/pages/TryOn.tsx` | Integrate TryOnTour component |
| `src/components/try-on/index.ts` | Export new tour components |

---

## Technical Details

### Eyewear Dropdown Implementation
```text
MainNav Changes:
1. Import NavigationMenu or use DropdownMenu (already imported)
2. Replace Eyeglasses/Sunglasses links with:
   DropdownMenu
   ├── DropdownMenuTrigger → "Eyewear" with CaretDown icon
   └── DropdownMenuContent
       ├── DropdownMenuItem → Eyeglasses
       ├── DropdownMenuItem → Sunglasses
       └── DropdownMenuItem → All Eyewear (links to /eyewear)
```

### Tour Component Architecture
```text
TryOnTour
├── useTryOnTour hook (manages step state + localStorage)
├── Overlay (semi-transparent backdrop)
├── Spotlight (CSS clip-path around target element)
└── TourStep (positioned tooltip)
    ├── Title
    ├── Description  
    ├── Step indicator (1/5, 2/5, etc.)
    └── Controls (Next, Skip, Finish)
```

### Element Targeting
Tour steps target elements using:
- `data-tour-step="upload"` attributes on components
- Or refs passed to tour component
- getBoundingClientRect() for positioning

---

## Visual Design

### Dropdown Menu
- Matches existing account dropdown styling
- Uses same animation (fade-in, zoom-in-95)
- High z-index (z-50) with solid background

### Tour Tooltips
- Glass-morphism background (blur + slight opacity)
- Gold accent border for premium feel
- Subtle entrance animations (fade + slide)
- Clear progress indication

---

## Implementation Order

1. **Navigation changes** (MainNav, mobile navs)
   - Add Eyewear dropdown
   - Add Virtual Try-On link
   
2. **Tour hook and components**
   - Create useTryOnTour hook
   - Build TourStep component
   - Build TryOnTour controller
   
3. **Integration**
   - Add data attributes to TryOn page elements
   - Integrate tour into TryOn page
   - Add restart tour button

4. **Testing**
   - Verify dropdown works on desktop/mobile
   - Test tour flow on different screen sizes
   - Ensure tour doesn't block functionality

---

## Benefits

- **Discoverability**: Virtual Try-On becomes immediately visible in main navigation
- **Organization**: Eyewear products grouped logically under one menu
- **User Guidance**: First-time users understand the VTO flow without confusion
- **Retention**: Help button allows users to replay tour anytime
- **Mobile-friendly**: Tour works on all device sizes
