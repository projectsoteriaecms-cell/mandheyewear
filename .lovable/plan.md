
# Snapchat Camera Kit AR Try-On Pilot Plan

## Build Error Fix (Pre-requisite)

**Issue**: The production build is failing with `disallowed-content-in-noscript-in-head` error, pointing to lines 22-24 in `index.html`. The current file has the noscript correctly in the `<body>`, but the build system appears to be using a cached/stale version.

**Fix Required**: Force a clean rebuild by making a minor whitespace change to `index.html`. This will invalidate the build cache and use the correct version.

---

## Overview: Minimal Camera Kit Pilot

This plan adds a **complementary real-time AR try-on mode** to the existing `/try-on` page. The AI-powered VTO remains the primary experience; Camera Kit adds an optional "Live Mirror" mode for users who want instant, interactive feedback.

---

## What Stays the Same

The existing VTO system is preserved completely:
- PhotoUpload component for static photos
- FramePicker carousel with 77+ frames
- AI generation via Gemini/Lovable AI Gateway
- TryOnResult with comparison view and "Verified Match" badge
- TryOnHistory for saved results
- Add to Cart / Wishlist integration

---

## What Gets Added

### User Experience
```text
/try-on Page Header
┌─────────────────────────────────────────────────────┐
│  Virtual Try-On                                     │
│  ┌──────────────────┬──────────────────────┐        │
│  │  📷 Photo Mode   │  ✨ Live AR Mode     │        │
│  │    (default)     │    (new)             │        │
│  └──────────────────┴──────────────────────┘        │
└─────────────────────────────────────────────────────┘

Photo Mode (existing):
- Upload photo → Select frame → AI generates composite

Live AR Mode (new):
- Front camera feed → Real-time 3D glasses overlay
- Swipe between lens presets → Instant frame switching
- Capture button → Saves snapshot to TryOnHistory
```

---

## Technical Implementation

### Phase 1: Core SDK Integration

**1. Install Camera Kit SDK**

Add to `package.json`:
```json
"@snap/camera-kit": "^0.10.0"
```

**2. Create TypeScript Definitions**

File: `src/types/camera-kit.d.ts`
- Declare global `CameraKitWebSDK` types
- Define `CameraKitSession`, `Lens`, `Source` interfaces

**3. Create Camera Kit Hook**

File: `src/hooks/useCameraKit.ts`
```text
useCameraKit()
├── isInitialized: boolean
├── isLoading: boolean
├── error: string | null
├── currentLens: Lens | null
├── availableLenses: Lens[]
│
├── initialize(canvasElement) → bootstraps SDK
├── switchLens(lensId) → loads different eyewear
├── captureFrame() → returns base64 snapshot
└── cleanup() → stops session, releases resources
```

**4. Create Lens Configuration**

File: `src/config/snap-lenses.ts`
```text
{
  LENS_GROUP_ID: string,
  demoLenses: [
    { id: "demo_1", name: "Classic Aviator", snapLensId: "..." },
    { id: "demo_2", name: "Round Frames", snapLensId: "..." }
  ]
}
```

For the pilot, we'll use 1-2 Snap sample eyewear lenses. Full product mapping comes in Phase 2.

---

### Phase 2: UI Components

**5. Mode Toggle Component**

File: `src/components/try-on/TryOnModeToggle.tsx`
- Tabs or segmented control: "Photo Mode" | "Live AR Mode"
- Persists selection in component state
- Shows "Beta" badge on AR mode

**6. Live AR Container**

File: `src/components/try-on/LiveARTryOn.tsx`
```text
┌────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  │           Live Camera + AR Overlay           │  │
│  │                                              │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ← Lens Selector │
│  │ Lens 1 │ │ Lens 2 │ │ Lens 3 │                 │
│  └────────┘ └────────┘ └────────┘                 │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │      [📸 Capture & Save to History]         │  │
│  └─────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**7. Camera Kit Canvas**

File: `src/components/try-on/CameraKitCanvas.tsx`
- Canvas element for SDK rendering
- Handles camera permissions gracefully
- Shows loading skeleton during initialization
- Fallback message for unsupported browsers

**8. AR Lens Selector**

File: `src/components/try-on/ARLensSelector.tsx`
- Horizontal scroll of available lenses
- Thumbnail + name for each lens
- Active state indicator
- Triggers `switchLens()` on selection

---

### Phase 3: Integration

**9. Modify TryOn Page**

File: `src/pages/TryOn.tsx`

Changes:
- Add `tryOnMode` state: `"photo" | "ar"`
- Import `TryOnModeToggle` and `LiveARTryOn`
- Render mode toggle below header
- Conditionally render Photo mode components OR LiveARTryOn
- Share `TryOnHistory` between modes (captures go to same history)

**10. Update Exports**

File: `src/components/try-on/index.ts`
- Export new components

---

## Required Credentials

### Snap Developer Setup (Required Before Implementation)

| Item | Where to Get It | What It's For |
|------|-----------------|---------------|
| Camera Kit API Token | [Snap Kit Portal](https://kit.snap.com/) | SDK authentication |
| Lens Group ID | Snap Kit Portal → Camera Kit app | Access to lenses |
| Demo Lens ID(s) | Lens Studio export | At least 1 lens for pilot |

These will need to be added as backend secrets:
- `SNAP_CAMERA_KIT_API_TOKEN` - Used client-side (safe to expose)
- Or configured in a public config file since Camera Kit tokens are designed for client-side use

---

## Browser Support & Fallbacks

### Supported Browsers
- Chrome 95+ (desktop & Android)
- Safari 16+ (macOS & iOS 15+)
- Edge 95+

### Fallback Strategy
1. Check `navigator.mediaDevices.getUserMedia` support
2. Check WebGL2 support (required for Camera Kit)
3. If unsupported → Show message with link to Photo mode
4. If camera denied → Show friendly prompt with retry option

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `src/types/camera-kit.d.ts` | TypeScript definitions |
| `src/hooks/useCameraKit.ts` | SDK lifecycle hook |
| `src/config/snap-lenses.ts` | Lens mapping config |
| `src/components/try-on/TryOnModeToggle.tsx` | Mode switcher UI |
| `src/components/try-on/LiveARTryOn.tsx` | AR mode container |
| `src/components/try-on/CameraKitCanvas.tsx` | Canvas wrapper |
| `src/components/try-on/ARLensSelector.tsx` | Lens carousel |

### Modified Files
| File | Changes |
|------|---------|
| `index.html` | Whitespace fix to clear build cache |
| `package.json` | Add `@snap/camera-kit` |
| `src/pages/TryOn.tsx` | Add mode toggle, conditional rendering |
| `src/components/try-on/index.ts` | Export new components |

---

## Implementation Order

1. **Fix build error** - Minor index.html edit to force cache clear
2. **Install SDK + types** - Package + declarations
3. **Create hook** - `useCameraKit` with full lifecycle
4. **Create lens config** - Placeholder until real tokens
5. **Build UI components** - Canvas, selector, container
6. **Integrate into TryOn page** - Mode toggle + conditional render
7. **Test with demo lens** - Verify AR overlay works
8. **Connect capture to history** - Snapshots flow into TryOnHistory

---

## Next Steps After Approval

1. I'll fix the build error immediately
2. Create the foundation files (types, hook, config)
3. Build the UI components
4. You'll need to: Apply for Camera Kit access at [kit.snap.com](https://kit.snap.com) and obtain your API Token + create at least one test lens in Lens Studio

The pilot will be functional with demo/sample lenses initially, then you can add custom M&H frame lenses as 3D models become available.
