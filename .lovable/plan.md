

## Align Onboarding with Progressive Redesign

### Current Problem
The onboarding wizard still has 5 steps: Welcome → Face Scan → Style Quiz → Lifestyle Poll → Complete. Per the agreed redesign (memory: `onboarding-personalization-flow`), it should be a **3-screen core flow**: Welcome → Quick Quiz (Gender, Frame Shape, Budget) → Complete. The Face Scan and Lifestyle Poll should not be in onboarding.

### What the Face Measurement Feature Does
It uses AI (Gemini 2.5 Flash) to estimate facial dimensions from a photo — face width, pupillary distance, bridge width, face shape. These measurements power **fit indicators** on product cards ("Good fit", "Too narrow") and personalized frame recommendations. It works fine technically — the issue is placement, not functionality.

### Changes

**1. Simplify OnboardingWizard to 3 steps**
- `src/components/onboarding/OnboardingWizard.tsx` — Change `STEPS` to `["welcome", "style-quiz", "complete"]`, remove face-scan and lifestyle-poll step rendering
- The StyleQuizStep will need to be updated to match the "Quick Quiz" spec (Gender, Frame Shape, Budget) if it doesn't already

**2. Verify StyleQuizStep matches the Quick Quiz spec**
- Review `src/components/onboarding/StyleQuizStep.tsx` to confirm it covers Gender, Frame Shape, Budget
- Adjust if needed to keep it lightweight (one screen, not multi-step)

**3. Keep Face Scan accessible elsewhere**
- The `FaceScanStep` component and `useFaceMeasurement` hook remain in the codebase — they're used for post-onboarding prompts on Product Detail Pages
- No deletion needed

### Files Changed
- `src/components/onboarding/OnboardingWizard.tsx` — reduce to 3 steps
- `src/components/onboarding/StyleQuizStep.tsx` — verify/adjust to Quick Quiz format

### What Stays the Same
- Face measurement edge function (`analyze-face`) — untouched
- `useFaceMeasurement` hook — untouched
- `FaceScanStep` component — kept for PDP prompts
- Database schema — no changes
- Onboarding enforcement logic — unchanged

