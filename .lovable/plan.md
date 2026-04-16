

# Google Cloud AI Cost Analysis for Stakeholders

## What I'll Create
A clean, professional **PDF document** summarizing the AI cost structure for the M&H Eyewear platform. This is designed to be shared with non-technical stakeholders so they understand exactly what they're paying for, how much it costs, and why no subscription is needed.

## Key Data Points in the Report

### Three AI Features & Their Costs
| Feature | Model | Cost Per Use | Monthly Volume |
|---------|-------|-------------|----------------|
| Product Image Generation (6-shot gallery) | Gemini 2.5 Flash (image) | ~$0.10/image | 2,000 total (one-time bulk) |
| Virtual Try-On (3-angle) | Gemini 2.5 Flash (image) | ~$0.08/try-on | ~500/month |
| Face PD Measurement | Gemini 2.5 Flash (text) | ~$0.002/scan | ~200/month |

### Budget Breakdown
- **One-time bulk**: 2,000 product images × $0.10 = ~$200
- **Monthly ongoing**: 500 VTO × $0.08 + 200 PD × $0.002 = ~$40.40/month
- **6-month runway on $500**: Covers the bulk generation + ~7 months of ongoing usage
- **12-month runway on $1,000**: Covers bulk + ~19 months of ongoing usage

### Report Sections
1. **Executive Summary** — What we're using AI for and why
2. **How It Works** — Simple explanation of pay-as-you-go (no subscription, no commitment)
3. **Cost Per Feature** — Breakdown table with per-unit costs
4. **Budget Scenarios** — $500 vs $1,000 prepaid, how long each lasts
5. **Monitoring** — How spend is tracked (Google Cloud Console dashboard)
6. **Recommendation** — Start with $500, monitor for 3 months, top up as needed

## Output
A single branded PDF at `/mnt/documents/mh-google-ai-cost-analysis.pdf` with M&H visual identity (Ink/Cream palette, clean typography).

## Technical Approach
Python script using `reportlab` to generate a polished PDF with tables, charts, and branded styling. No Lovable references — purely framed as Google Cloud AI platform costs.

