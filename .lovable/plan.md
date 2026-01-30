
# AI-Powered Virtual Try-On Implementation Plan

## Overview
Implement a complete Virtual Try-On experience that uses AI image generation (via your Gemini API) to composite eyewear frames onto user photos, creating realistic previews of how frames look on the customer's face.

## Architecture Summary

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER FLOW                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Upload Photo → 2. Select Frame → 3. AI Generates Overlay → 4. View │
│                                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────┐    ┌─────────┐ │
│  │  Camera  │───▶│ Frame Picker │───▶│ Edge Function  │───▶│ Result  │ │
│  │ or Photo │    │   (Browse)   │    │ (Gemini API)   │    │ Gallery │ │
│  └──────────┘    └──────────────┘    └────────────────┘    └─────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## What You'll Need to Provide

| Item | Description | Status |
|------|-------------|--------|
| **Gemini API Key** | Your Google AI API key from [aistudio.google.com](https://aistudio.google.com) | Required before implementation |

**Estimated Cost with Your API Key:**
- ~$0.02 per try-on (using Gemini 2.5 Flash with image generation)
- ~$20/month for 1,000 try-ons
- No Lovable credits consumed for AI operations

---

## Technical Implementation

### Phase 1: Backend Setup

**1.1. Add Gemini API Secret**
- Store your `GEMINI_API_KEY` as a Supabase secret
- This keeps your key secure and server-side only

**1.2. Create New Edge Function: `virtual-try-on`**

```text
supabase/functions/virtual-try-on/index.ts
```

**Function Logic:**
1. Receive user photo (base64) + frame details (name, color, style, image URL)
2. Call Gemini API with image generation capabilities
3. Prompt the AI to composite the frame onto the face naturally
4. Return the generated image (base64)

**Prompt Engineering Approach:**
```text
"You are an expert eyewear designer. Given this front-facing face photo and 
this eyewear frame image, create a photorealistic composite showing the 
person wearing the glasses. The frame should be:
- Properly scaled to match the face width
- Positioned correctly on the nose bridge
- Following natural perspective and lighting
- Blended seamlessly with the original photo"
```

**Edge Cases Handled:**
- Face not detected → Return error message
- Poor image quality → Return guidance
- Rate limiting → Queue retry with backoff
- API errors → Graceful fallback

### Phase 2: Frontend Enhancement

**2.1. Update TryOn Page (`src/pages/TryOn.tsx`)**

Transform the current placeholder page into a full try-on experience:

```text
┌───────────────────────────────────────────────────────────┐
│  [YOUR PHOTO]                    [TRY-ON RESULT]          │
│  ┌─────────────────┐             ┌─────────────────┐      │
│  │                 │   ═══▶      │   AI Generated  │      │
│  │  Uploaded Face  │             │   Composite     │      │
│  │                 │             │                 │      │
│  └─────────────────┘             └─────────────────┘      │
│                                                            │
│  ────────── SELECT A FRAME ──────────                     │
│  [Frame 1] [Frame 2] [Frame 3] [Frame 4] [Frame 5]  ▶     │
│                                                            │
│  [🔄 Try Another] [❤️ Save] [📤 Share] [🛒 Add to Cart]  │
└───────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Photo Upload/Camera**: Reuse logic from FaceScanStep
- **Frame Carousel**: Browse available frames with thumbnails
- **Generation State**: Loading animation while AI processes
- **Result Display**: Side-by-side original vs try-on
- **Actions**: Save to favorites, share, add to cart

**2.2. Create New Hook: `useVirtualTryOn`**

```typescript
// src/hooks/useVirtualTryOn.ts
interface TryOnResult {
  success: boolean;
  compositeImage?: string;  // base64 result
  error?: string;
}

// Functions:
- generateTryOn(userPhoto, frameDetails): Promise<TryOnResult>
- isGenerating: boolean
- currentResult: TryOnResult | null
- savedTryOns: TryOnResult[]  // Session history
```

**2.3. Create Frame Picker Component**

```text
src/components/try-on/FramePicker.tsx
```

- Horizontal scrollable carousel
- Filter by category (sunglasses, eyeglasses)
- Shows frame image, name, price
- Click to trigger try-on generation

**2.4. Create Try-On Result Component**

```text
src/components/try-on/TryOnResult.tsx
```

- Side-by-side comparison view
- Zoom/pan capabilities
- Download button
- Share to social (optional)

### Phase 3: Integration & Polish

**3.1. Product Detail Page Integration**
Add "Try On This Frame" button to `src/pages/ProductDetail.tsx`:
- Opens modal or navigates to try-on page
- Pre-selects the current product
- Uses stored face photo if available

**3.2. Try-On History (Optional Enhancement)**
- Store generated images temporarily (session)
- Allow comparison of multiple frames
- "Compare" mode showing 2-4 frames side-by-side

**3.3. Link from VirtualTryOn Promo**
The existing `VirtualTryOn.tsx` homepage component already links to `/try-on` — this will now be functional.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/virtual-try-on/index.ts` | **Create** | New edge function for AI generation |
| `supabase/config.toml` | **Update** | Register new edge function |
| `src/pages/TryOn.tsx` | **Rewrite** | Full try-on experience |
| `src/hooks/useVirtualTryOn.ts` | **Create** | Try-on state management |
| `src/components/try-on/FramePicker.tsx` | **Create** | Frame selection carousel |
| `src/components/try-on/TryOnResult.tsx` | **Create** | Result display component |
| `src/components/try-on/TryOnComparison.tsx` | **Create** | Side-by-side comparison |
| `src/components/try-on/index.ts` | **Create** | Export barrel |
| `src/pages/ProductDetail.tsx` | **Update** | Add try-on CTA button |

---

## API Cost Details

### Gemini Pricing (Pay-as-you-go)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Image Generation |
|-------|----------------------|------------------------|------------------|
| Gemini 2.5 Flash | $0.075 | $0.30 | ~$0.02 per image |
| Gemini 2.5 Pro | $1.25 | $5.00 | ~$0.05 per image |

**Recommended Model:** `gemini-2.5-flash-exp-image-generation`
- Best balance of quality and cost
- Supports image input + output
- Fast generation (~3-5 seconds)

### Monthly Projections

| Usage Level | Try-Ons/Month | Estimated Cost |
|-------------|---------------|----------------|
| Light | 100 | ~$2 |
| Moderate | 500 | ~$10 |
| Active | 1,000 | ~$20 |
| Heavy | 5,000 | ~$100 |

---

## User Experience Flow

1. **User visits `/try-on`** or clicks "Try On" on product page
2. **Upload/capture photo** (can reuse onboarding face scan)
3. **Browse frame carousel** or pre-selected frame
4. **Click "Try This Frame"** → loading state
5. **AI generates composite** (~3-5 seconds)
6. **View result** side-by-side with original
7. **Actions**: Try another, save, share, add to cart

---

## Error Handling Strategy

| Scenario | User Message | Action |
|----------|--------------|--------|
| No face detected | "We couldn't detect a face. Please upload a clear, front-facing photo." | Retry prompt |
| API rate limit | "High demand right now. Please try again in a moment." | Auto-retry after 5s |
| API error | "Something went wrong. Please try again." | Log error, show retry |
| Low quality image | "For best results, please use a well-lit photo." | Guidance tips |

---

## Security Considerations

- **API Key Protection**: Stored server-side only (Supabase secret)
- **Image Processing**: Images processed in-memory, not stored permanently
- **Rate Limiting**: Implement per-user limits (e.g., 20/hour)
- **Content Moderation**: Gemini has built-in safety filters

---

## Next Steps

1. **Provide your Gemini API Key** — I'll securely store it as a secret
2. **I'll implement Phase 1** — Edge function setup
3. **I'll implement Phase 2** — Frontend UI
4. **Testing & Polish** — End-to-end testing

Would you like me to proceed once you provide the API key?
