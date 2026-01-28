

# Personalization & Face Measurement System

## Overview

This plan creates a comprehensive personalization system that captures physical face measurements and style preferences during onboarding, then uses this data to power personalized shopping experiences and generate platform insights.

---

## What We're Building

### For Customers

**Smart Onboarding Flow**
After creating an account, new users will be guided through a personalization journey that includes:
- Face scanning to capture measurements (face width, pupillary distance, bridge size)
- Face shape detection (oval, round, square, heart, oblong)
- Style preference questions (colors, usage, budget)
- Lifestyle polls that help us understand their needs better

**Personalized Shopping**
Once we have their profile:
- Products will be scored and ranked by how well they match
- "Great Fit" and "Style Match" badges will appear on matching frames
- A dedicated "For You" section shows personalized recommendations
- Frame fit indicators (narrow, standard, wide) based on actual measurements

### For the Platform

**Insights Dashboard** (Admin)
- Aggregate data on popular face shapes, style preferences, budget ranges
- Trends over time (what styles are gaining popularity)
- Conversion rates by personalization completion
- Data to inform inventory and product decisions

---

## Technical Implementation

### Phase 1: Database Setup

Create tables to store personalization data and analytics:

| Table | Purpose |
|-------|---------|
| `user_measurements` | Store face scan results with timestamps |
| `style_polls` | Define poll questions for collecting preferences |
| `poll_responses` | Store user responses for analytics |
| `personalization_analytics` | Aggregate insights for admin dashboard |

**Face Dimensions Structure** (stored in profiles.face_dimensions):
- Face Width (mm)
- Pupillary Distance / PD (mm)
- Bridge Width (mm)
- Temple-to-Temple Width (mm)
- Face Shape (detected)
- Confidence Score
- Scan Date

### Phase 2: Onboarding Flow

Create a multi-step wizard that appears after account creation:

```text
Step 1: Welcome
   "Let's personalize your experience"
   ↓
Step 2: Face Scan (Optional)
   Camera access → AI detects landmarks → Calculate measurements
   OR Skip for manual selection
   ↓
Step 3: Style Quiz (Existing, Enhanced)
   Face shape, frame styles, colors
   ↓
Step 4: Lifestyle Poll
   "What's most important to you?" (Comfort/Style/Durability/Price)
   "How often do you change glasses?"
   ↓
Step 5: Complete
   Show profile summary, redirect to recommendations
```

### Phase 3: Face Scanning Technology

**Approach: AI-Powered Analysis via Lovable AI**

Instead of running heavy TensorFlow models in the browser, we'll:
1. User uploads/captures a front-facing photo
2. Send image to an edge function
3. Edge function uses Lovable AI (Gemini with vision) to:
   - Detect face landmarks
   - Estimate face shape
   - Calculate proportional measurements
4. Return structured data to save in profile

**Why this approach?**
- No heavy client-side libraries (TensorFlow.js is 5MB+)
- More accurate than browser-based models
- Easier to improve and iterate
- Works consistently across devices

**Measurement Calculation:**
Using reference points (standard iris diameter ~11.7mm), the AI can estimate:
- Face width from temple-to-temple landmarks
- PD from pupil centers
- Bridge width from nose bridge landmarks

### Phase 4: Personalization Engine

Create a scoring algorithm that matches users to products:

**Match Scoring (0-100 points):**

| Factor | Points | Logic |
|--------|--------|-------|
| Frame Width Fit | 25 | User face width matches product frame_width |
| Bridge Fit | 15 | User bridge measurement matches product bridge_size |
| Style Match | 20 | User's preferred styles contain product style |
| Color Match | 20 | User's preferred colors contain product color |
| Budget Match | 20 | Product price tier matches user budget |

**Fit Recommendations:**
- "Perfect Fit" - Frame width within 2mm of face width
- "Good Fit" - Frame width within 5mm
- "Narrow Fit" - Frame is smaller than ideal
- "Wide Fit" - Frame is larger than ideal

### Phase 5: Enhanced UI Components

**Product Cards:**
- Add "Great Match 95%" badge for high-scoring products
- Show fit indicator icon (checkmark for good fit)
- Highlight matching attributes on hover

**Eyewear Page:**
- New "Recommended for You" section at top
- Toggle: "All Products" | "For You"
- Filter by fit type (Narrow/Standard/Wide)

**Dashboard - Frame Profile:**
- Show face scan results with visual diagram
- Display all measurements with edit option
- Show fit statistics (what % of catalog fits)

### Phase 6: Polls & Ongoing Data Collection

Periodic polls to gather insights:
- In-app prompts after key actions (purchase, browse)
- "Quick poll" widget in dashboard
- Email surveys for engagement

Poll data structure:
- Question text and type (single/multi select)
- Response options
- Timestamps and user attribution
- Analytics aggregation

### Phase 7: Admin Insights Dashboard

New section in Admin Reports:

**Personalization Analytics:**
- % of users with complete profiles
- Most common face shapes (pie chart)
- Popular style preferences (bar chart)
- Budget distribution
- Poll response summaries

**Recommendation Performance:**
- Conversion rate: personalized vs non-personalized users
- Most recommended products
- Fit match accuracy feedback

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/onboarding/OnboardingWizard.tsx` | Main onboarding flow container |
| `src/components/onboarding/WelcomeStep.tsx` | Introduction screen |
| `src/components/onboarding/FaceScanStep.tsx` | Camera/upload for face measurement |
| `src/components/onboarding/StyleQuizStep.tsx` | Embedded style quiz |
| `src/components/onboarding/LifestylePollStep.tsx` | Poll questions |
| `src/components/onboarding/CompleteStep.tsx` | Summary and CTA |
| `src/hooks/useFaceMeasurement.ts` | Hook for face scan logic |
| `src/hooks/usePersonalizedProducts.ts` | Scoring and matching logic |
| `src/hooks/useStylePolls.ts` | Poll fetching and responses |
| `src/pages/Onboarding.tsx` | Onboarding page route |
| `supabase/functions/analyze-face/index.ts` | Edge function for AI face analysis |
| `src/components/eyewear/MatchBadge.tsx` | Visual match indicator |
| `src/components/eyewear/FitIndicator.tsx` | Fit size indicator |
| `src/components/admin/reports/PersonalizationInsights.tsx` | Admin analytics |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Signup.tsx` | Redirect to onboarding after signup |
| `src/pages/TryOn.tsx` | Integrate face scanning with measurement capture |
| `src/components/dashboard/FrameProfileSection.tsx` | Display real measurements |
| `src/components/eyewear/ProductCard.tsx` | Add match badge and fit indicator |
| `src/pages/Eyewear.tsx` | Add "For You" section and personalization toggle |
| `src/routes/public.routes.tsx` | Add `/onboarding` route |
| `src/pages/admin/Reports.tsx` | Add personalization insights section |

---

## User Journey Summary

```text
New User Signs Up
       ↓
Redirected to Onboarding Wizard
       ↓
[Optional] Scan Face → Get Measurements
       ↓
Complete Style Quiz
       ↓
Answer Lifestyle Poll
       ↓
Profile Complete → See Recommendations
       ↓
Browse Eyewear with Personalized Badges
       ↓
Periodic Polls Gather More Insights
       ↓
Admin Sees Aggregate Analytics
```

---

## Data Flow Diagram

```text
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│   Face Photo    │────▶│  Edge Function   │────▶│ profiles table │
│  (Camera/Upload)│     │  (Lovable AI)    │     │ face_dimensions│
└─────────────────┘     └──────────────────┘     └────────────────┘
                                                         │
┌─────────────────┐     ┌──────────────────┐             │
│   Style Quiz    │────▶│ profiles table   │◀────────────┘
│   Responses     │     │ frame_preferences│
└─────────────────┘     └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Personalization  │
                        │ Scoring Engine   │
                        └────────┬─────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
       ┌────────────┐    ┌─────────────┐    ┌─────────────┐
       │ Match Badges│   │ For You     │    │ Fit         │
       │ on Products │   │ Section     │    │ Indicators  │
       └────────────┘    └─────────────┘    └─────────────┘
```

---

## Implementation Priority

1. **Database migrations** - Create tables for measurements and polls
2. **Onboarding wizard** - Core multi-step flow
3. **Face scanning edge function** - AI-powered measurement
4. **Personalization hook** - Product scoring logic
5. **UI enhancements** - Badges, indicators, "For You" section
6. **Admin insights** - Analytics dashboard
7. **Polls system** - Ongoing data collection

This creates a complete personalization ecosystem that improves with every user interaction while respecting privacy (all processing happens via secure backend, no external tracking).

