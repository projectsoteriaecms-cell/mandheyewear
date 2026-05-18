## Goal

Live AR isn't production-ready. Hide the broken experience behind a clear "Coming Soon" state so users still discover the feature, anticipate it, and we capture intent — without exposing a half-working camera flow.

## Recommended approach

A two-part treatment:

1. **Mode toggle** — keep the "Live AR" tab visible but swap the "Beta" badge for **"Coming Soon"**. Tab stays clickable so the section is discoverable.
2. **Tab content** — when "Live AR" is selected, render a polished **Coming Soon panel** instead of `LiveARTryOn`. Panel includes:
   - Hero icon + headline ("Live AR Try-On is almost here")
   - Short value prop (real-time, move your head, see frames track your face)
   - 3 feature bullets (instant preview, true-to-life fit, works on mobile)
   - **"Notify me when it launches"** CTA → captures email into a `vto_waitlist` table (or reuses existing `vto_email_capture` flow) tagged `source: 'live_ar'`
   - Secondary CTA: **"Try Photo Mode instead"** → switches to photo tab
   - Small note: "Currently in development — photo try-on works great today"

## Why this over alternatives

- **Pure hide**: loses the marketing surface and the chance to gauge demand.
- **Disabled tab**: feels broken, no engagement path.
- **Coming Soon + waitlist**: keeps the feature visible, sets expectations honestly, and turns the gap into a lead source that routes into the same Brevo M&H list we just wired up.

## Files to change

- `src/components/try-on/TryOnModeToggle.tsx` — change badge text to "Coming Soon", restyle (muted/outline tone, not accent).
- `src/pages/TryOn.tsx` — replace the `<LiveARTryOn />` render in the `tryOnMode === "ar"` branch with a new `<LiveARComingSoon />` component. Drop the `arReadyIds` / `arFrameProducts` query while AR is dormant (or keep behind a feature flag).
- `src/components/try-on/LiveARComingSoon.tsx` (new) — the panel above. Reuses `useVTOEmailCapture` for the notify form, or posts to `brevo-sync` with `source: 'live_ar_waitlist'`.
- `src/components/try-on/index.ts` — export the new component.

## Open questions

1. **Waitlist storage** — reuse `useVTOEmailCapture` (existing VTO email capture hook) and tag it `source: 'live_ar_waitlist'`, or push straight to Brevo via the new `brevo-sync` function with that tag? I'd recommend the latter so it lands in the M&H list immediately.
2. **Should the "Live AR" tab stay visible at all**, or do you want it hidden entirely until launch? Keeping it visible is better for demand signal; hiding is cleaner if you don't want any "coming soon" surface.

Tell me your preference on those two and I'll implement.
