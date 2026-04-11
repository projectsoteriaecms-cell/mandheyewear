

## Personalized Customer Experience: Simplified Quiz + Behavioral Tracking + Email Marketing

### What You're Describing

You want a Jumia/TEMU-style experience where:
1. The style quiz is shorter and fully optional (no budget gate)
2. The system silently tracks what products users browse, search, and interact with
3. That behavioral data drives personalized "recommended for you" sections
4. Users who sign up get email campaigns based on their browsing interests
5. The more they browse, the smarter the recommendations get

### What Will Be Built

#### 1. Simplified Style Quiz (Both Onboarding + Standalone)

**Current**: 3 steps in onboarding (Gender → Frame Shape → Budget), 7 steps on standalone page.

**New**: Reduce to a single-page "quick pick" format:
- Show Gender + Frame Shape on one screen (no separate steps)
- Remove Budget as a required step entirely — make it an optional toggle
- All fields optional — user can skip any/all and still proceed
- Remove the step-by-step wizard feel; make it feel like a casual "tell us what you like" card
- Standalone `/style-quiz` page: reduce from 7 steps to 3 max (Gender + Frame Shape → Face Shape + Material → Results)

#### 2. Behavioral Tracking System (Browsing History)

**New database table**: `user_activity` to track product views, searches, category visits, and cart actions.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Authenticated user |
| activity_type | text | `product_view`, `category_view`, `search`, `add_to_cart`, `wishlist_add` |
| product_id | uuid (nullable) | Which product was viewed |
| category | text (nullable) | Category browsed |
| search_query | text (nullable) | What they searched |
| metadata | jsonb | Extra context (time spent, referrer, etc.) |
| created_at | timestamptz | When it happened |

**Tracking hooks**: A `useTrackActivity` hook that silently logs events from:
- `ProductDetail.tsx` — log `product_view` when a product page loads
- Category/shop page — log `category_view` when filtering
- Search — log `search` queries
- Cart — log `add_to_cart` events

#### 3. "Recently Viewed" + "You Might Like" Sections

- Add a "Recently Viewed" carousel to the homepage and shop page using the `user_activity` table
- Add a "Based on Your Browsing" section that recommends products similar to what they've viewed (same brand, style, material, price range)
- These work even without the quiz — purely behavioral

#### 4. Email Marketing Data Collection

- On signup, the user's email is already stored in profiles — ensure it also goes into `newsletter_subscribers` automatically (opt-in by default with unsubscribe option)
- Create an edge function `send-marketing-email` that can be triggered to send personalized product recommendations based on browsing history
- Build a "browsing digest" email template: "You recently looked at these frames — here are similar picks"
- Operations team can trigger campaigns or they can be scheduled

#### 5. Recommendation Engine Enhancement

- Update `usePersonalizedProducts` to factor in browsing history (products viewed = higher weight for similar products)
- Products in the same style/brand/price range as frequently viewed items get boosted
- No limit on recommendations — show all scored products, sorted by relevance

### Database Changes
1. Create `user_activity` table with RLS (users can insert own, admins can read all)
2. Auto-insert into `newsletter_subscribers` on signup (update the `handle_new_user` trigger)
3. Enable realtime on `user_activity` for admin analytics dashboard (optional)

### Files to Create
- `src/shared/hooks/useTrackActivity.ts` — silent activity tracker hook
- `src/components/shop/RecentlyViewed.tsx` — recently viewed carousel
- `src/components/shop/BrowsingRecommendations.tsx` — "you might like" section
- `supabase/functions/send-marketing-email/index.ts` — personalized email campaigns

### Files to Modify
- `src/components/onboarding/StyleQuizStep.tsx` — collapse to single-screen, all optional
- `src/pages/StyleQuiz.tsx` — reduce to 3 steps max, remove mandatory fields
- `src/pages/ProductDetail.tsx` — add activity tracking on view
- `src/pages/Eyewear.tsx` — add Recently Viewed + Browsing Recommendations sections
- `src/modules/personalization/hooks/usePersonalizedProducts.ts` — incorporate browsing data into scoring
- `src/pages/Index.tsx` — add Recently Viewed section for logged-in users

### Technical Notes
- Activity tracking is fire-and-forget (non-blocking inserts)
- Email marketing uses existing Resend integration via `notify.mandheyewear.com`
- Newsletter auto-subscribe respects existing `newsletter_subscribers` table
- All browsing data is tied to authenticated users only (anonymous browsing not tracked)

