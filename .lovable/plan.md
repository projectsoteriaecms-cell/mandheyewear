

# Updated AR Platform Cost Analysis v3 — Expanded Competitive Comparison

## What Changed

The existing v2 PDF only compared Google+Snap vs Banuba. The two uploaded research documents contain detailed evaluations of **9 additional AR/SaaS platforms** that need to be incorporated into an expanded comparison matrix. Also, references to "Google AI Ultra plan" in the DCH research brief should be ignored — the correct framing is the **Google Gemini paid API** (pay-as-you-go), which is already how v2 presents it.

## Platforms to Include in Expanded Comparison

From the research documents, the following platforms will be added alongside the existing Google+Snap and Banuba entries:

| Platform | Type | Monthly Cost | Key Strength |
|----------|------|-------------|--------------|
| **Fittingbox** | SaaS + Plugin | $59–$199/mo | 195K pre-digitised frames, frame removal, easiest integration |
| **GlamAR** | SaaS + SDK | Flexible/tiered | Best value — AR + PD + AI model generation in one |
| **Perfect Corp (YouCam)** | Enterprise SaaS | Enterprise pricing | Best photo try-on quality, used by Essilor/Safilo |
| **OculFit** | SaaS + API | €70–€200/mo | Clinical-grade (<1mm PD), seg height, vertex distance |
| **Zakeke** | SaaS + Plugin | $29.90–$149.90/mo | Affordable, hyper-realistic WebAR, 3D configurator |
| **VARAi** | SaaS + Toolkit | ~$129+/mo | AI Content Studio, auto-3D models |
| **DeepAR** | SDK | Free–$99/mo | AR effects only, no PD — not recommended |
| **MirrAR** | Enterprise | Custom pricing | Multi-category (jewellery/watches), retail-only |
| **Snap Lens Studio** | Free SDK | $0 licensing | Highest capability, highest build cost |

## PDF Structure (v3)

The new PDF (`/mnt/documents/mh-platform-cost-analysis-v3.pdf`) will retain all v2 content and add:

### New Section: "Comprehensive AR SDK & SaaS Market Comparison" (after current Section 3)
- **Full comparison matrix** — all 11 platforms evaluated across: Live AR Try-On, PD Measurement, Facial Diagnostics, Photo Try-On, Integration Complexity, Pricing, and Platform Assessment
- **Pricing comparison chart** — visual bar chart showing annual cost of each platform vs M&H's Google+Snap approach (₦0 SDK + dev fee)
- **3-Year TCO table** — Total Cost of Ownership comparing M&H approach vs subscribing to Banuba, Fittingbox, OculFit, etc.
- **DCH Recommendation** framing the phased approach from the research: Phase 1 (GlamAR for retail), Phase 1 Clinical (Banuba for PD), Phase 2 (Snap Lens Studio for SaaS scale)

### Updated Section: Competitive Advantage
- Expand beyond just Banuba — show how Google+Snap beats all subscription-based alternatives on cost
- Emphasize: "Google AI Ultra" is NOT what powers this — it is the **Gemini paid API** (pay-as-you-go, no subscription)

### All Existing Sections Retained
- Executive Summary, Power Couple architecture, cost breakdown, budget runway, maintenance, Year 1 projection, recommendation — all carried forward from v2

## Technical Approach
Python + ReportLab branded PDF with M&H Ink/Cream palette. Same styling as v2. Approximately 12–14 pages. No mention of Lovable. All "Google AI Ultra" references from the research docs will be reframed as "Google Gemini API (pay-as-you-go)."

