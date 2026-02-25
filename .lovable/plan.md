

# Congratulations Toast and Personalized Redirect After Onboarding

## What Changes

### 1. Update `src/components/onboarding/OnboardingWizard.tsx`
- Import `toast` from `@/hooks/use-toast`
- Update `handleComplete` to show a congratulations toast before navigating to `/eyewear?from=onboarding`
- The toast will say something like "Profile complete! Here are your personalized picks."
- Add a query param `from=onboarding` so the Eyewear page knows to highlight recommendations

### 2. Update `src/pages/Eyewear.tsx`
- Read the `from=onboarding` search param on mount
- When present, auto-scroll to the "Recommended For You" section and show a brief highlight animation (a pulsing border or glow on the recommendations section)
- Clean up the param from the URL after reading it (so refresh doesn't re-trigger)
- Add a `ref` on the recommendations section container to enable `scrollIntoView`

### Technical Details

**OnboardingWizard.tsx changes:**
```
const handleComplete = () => {
  toast({
    title: "Profile Complete!",
    description: "Your personalized recommendations are ready.",
  });
  navigate("/eyewear?from=onboarding");
};
```

**Eyewear.tsx changes:**
- Add a `useRef` for the recommendations section div
- On mount, if `searchParams.get("from") === "onboarding"`, scroll to the ref after a short delay and apply a temporary highlight class
- Remove the `from` param from the URL via `setSearchParams`

