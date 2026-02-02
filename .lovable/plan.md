
# Virtual Try-On Email Capture & Lead Generation Strategy

## Overview

This plan implements a smart email capture system that triggers when users want to download or share their VTO result. The goal is to capture leads for email marketing while providing genuine value (they receive a high-quality version of their try-on).

---

## Strategic Approach: "Email to Download"

### Why This Works
1. **Value Exchange**: User gets their try-on result via email (feels premium)
2. **Higher Quality**: Email can include high-res version + frame details + purchase link
3. **Permission Marketing**: User explicitly consents to receive their result
4. **Remarketing**: Captured email enables follow-up campaigns for that specific frame

### User Flow
```text
User completes VTO → Clicks "Download" or "Share"
                           ↓
              ┌─────────────────────────────────────┐
              │  📧 Get Your Try-On via Email       │
              │                                     │
              │  We'll send you a high-quality      │
              │  version with frame details and     │
              │  a direct purchase link.            │
              │                                     │
              │  [________________@_______]         │
              │                                     │
              │  □ Send me style tips & offers      │
              │                                     │
              │  [  Send to My Email  ]             │
              │  ─────────────────────────          │
              │  Already have an account? Sign in   │
              └─────────────────────────────────────┘
```

---

## Technical Implementation

### Phase 1: Email Capture Modal

**New Component: `src/components/try-on/EmailCaptureModal.tsx`**

Features:
- Appears when user clicks Download or Share (if not logged in)
- Email input with validation
- Optional marketing consent checkbox
- Shows the try-on result preview
- "Sign in" link for existing users
- Skip option (allows direct download without email)

**Behavior:**
- **Logged-in users**: Skip modal, use profile email, send directly
- **Guest users**: Show modal to capture email
- **After submission**: Download begins + email is sent

---

### Phase 2: Backend Edge Function

**New Function: `supabase/functions/send-tryon-result/index.ts`**

Sends a beautiful email containing:
- High-resolution try-on image (base64 embedded or uploaded to storage)
- Frame details (name, price, SKU)
- "Shop This Frame" CTA button linking to product page
- "View More Frames" link to /eyewear
- Social sharing links
- Unsubscribe link (for GDPR/CAN-SPAM compliance)

---

### Phase 3: Lead Storage

**New Database Table: `vto_email_leads`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | Captured email |
| created_at | timestamp | When captured |
| frame_id | uuid | Frame they tried on (FK to products) |
| frame_name | text | Frame name (denormalized for analytics) |
| marketing_consent | boolean | Opted in for marketing |
| source | text | 'vto_download' or 'vto_share' |
| user_id | uuid | If later linked to account |

RLS Policy: Insert allowed for anonymous, Select/Update for authenticated admins only.

---

### Phase 4: Analytics Integration

**Meta Pixel Lead Tracking**

When email is captured, fire the Lead event:
```typescript
trackLead({
  content_name: result.frameDetails?.name,
  content_category: "virtual_try_on",
});
```

This enables:
- Lookalike audiences from VTO leads
- Retargeting campaigns
- Conversion attribution for social ads

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/components/try-on/EmailCaptureModal.tsx` | Modal for capturing email before download |
| `supabase/functions/send-tryon-result/index.ts` | Edge function to email the try-on result |
| `src/hooks/useVTOEmailCapture.ts` | Hook managing capture logic + submissions |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/try-on/TryOnResult.tsx` | Wire Download/Share to trigger email capture |
| `src/components/try-on/index.ts` | Export EmailCaptureModal |
| `src/pages/TryOn.tsx` | Add email capture state management |

### Database Changes
| Change | Description |
|--------|-------------|
| Create `vto_email_leads` table | Store captured emails with frame context |
| RLS policies | Secure insert for anon, read for admins |

---

## Email Template Design

The email will include:

**Subject**: "Your Virtual Try-On: [Frame Name] 🕶️"

**Body Structure**:
1. **Header**: Soteria/M&H branding
2. **Hero Image**: The try-on result (full-width)
3. **Frame Details Block**:
   - Frame name
   - Price
   - Color/Style
4. **Primary CTA**: "Shop This Frame" (links to product page)
5. **Secondary CTA**: "Browse All Frames"
6. **Social**: "Share your look" with social icons
7. **Footer**: Contact info, unsubscribe, privacy policy

---

## Implementation Order

1. **Database table** - Create `vto_email_leads` with RLS
2. **Edge function** - Build email template and sending logic
3. **Email capture modal** - UI component with form validation
4. **Hook** - `useVTOEmailCapture` for state + submission
5. **Integration** - Wire into TryOnResult Download/Share
6. **Analytics** - Fire Lead pixel event on capture
7. **Testing** - Verify flow for both guests and logged-in users

---

## Alternative Approaches Considered

### Option A: Require email for ALL try-ons (not recommended)
- Higher friction, lower completion rates
- Better for lead gen but damages UX

### Option B: Email capture on second try-on
- "Loved this one? Save it to your inbox"
- Less intrusive but lower capture rate

### Option C: Email capture on download (RECOMMENDED ✓)
- User already showed high intent (wants to save)
- Value exchange is clear (they get the result)
- Non-blocking (skip option available)

---

## Future Enhancements

Once email capture is live:

1. **Automated Follow-up Sequence**:
   - Day 1: "Still thinking about [Frame]?"
   - Day 3: "Complete your purchase - 10% off"
   - Day 7: "New arrivals similar to [Frame]"

2. **Segment by Frame Style**:
   - Tag leads by frame category (aviator, round, etc.)
   - Personalized recommendations

3. **Cart Abandonment for VTO**:
   - If they captured email + added to cart but didn't buy
   - Trigger recovery sequence

---

## Technical Requirements

**Already Configured:**
- RESEND_API_KEY ✓ (in secrets)
- Meta Pixel with trackLead ✓

**Needed:**
- Verified sending domain (currently using `onboarding@resend.dev`)
- For production, verify soteriaeyeclinic.com or mhopticians.com
