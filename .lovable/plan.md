

## Fix Scrolling Ticker + Add Endless Product Scroll + More Quotes

### Issues Found
1. **Ticker not visibly scrolling** — The CSS `@keyframes ticker` animation exists but the `animate-[ticker_35s_linear_infinite]` Tailwind arbitrary value may not be linking properly. Will switch to a proper CSS class.
2. **Product row doesn't scroll endlessly** — Currently a finite `overflow-x-auto` row. Needs to become an infinite marquee-style auto-scroll like the ticker.
3. **Only ~10 unique quotes** — User wants many more brand-aligned quotes.

### Changes — `HeroSection.tsx` + `index.css`

#### 1. Fix the quote ticker scroll
- Replace the Tailwind arbitrary `animate-[ticker_35s_linear_infinite]` with a proper CSS class (e.g., `.ticker-track`) defined in `index.css` that uses the existing `@keyframes ticker`.
- Ensure the quotes array is duplicated (2x) so `translateX(-50%)` creates a seamless loop.

#### 2. Make the product row scroll endlessly
- Duplicate the `flashDeals` array (2x) inside the product row container.
- Apply the same marquee-style CSS animation (new class `.product-ticker`) with a slower speed (~45s).
- Add `pause-on-hover` so users can interact with products.
- Wrap in the same gradient-mask container for polished edges.

#### 3. Expand quotes to 25+
Add brand puns across all three pillars (Visionary, Shakara, Soft Life):

- "Who dey see pass you? Nobody." 
- "Glass na crown — wear am like king."
- "Them go adjust when clarity enter room."
- "Style no be noise, na frequency."
- "One frame, many compliments — that's the soft life."
- "Better vision, better decisions."
- "E no be every eye wey fit see levels."
- "Your face, your billboard — advertise well."
- "When you see clear, fear no fit hold you."
- "Na who dey look sharp dey collect sharp things."
- "Luxury wey your eyes deserve."
- "Outlook dey different when the lens dey right."
- "No be swag — na standard."
- "For those who see the future before it arrives."
- "If your vision no clear, your moves go blur."
- Plus the existing 10 quotes.

#### 4. CSS additions (`index.css`)
- Add `.ticker-track` class using `@keyframes ticker` at 35s.
- Add `.product-ticker` class using same keyframes at 45s.
- Add `hover:pause` rule: `animation-play-state: paused` on hover for product row.

### Result
Both the brand quotes and the product frames scroll infinitely and seamlessly, with ~25 unique quotes rotating through the ticker.

