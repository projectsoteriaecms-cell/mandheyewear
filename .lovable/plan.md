

# AR Platform Cost Analysis — Stakeholder-Ready PDF

## Context

Your system already uses **Google MediaPipe** (free, open-source, Apache 2.0) for Live AR face tracking — this is Google's equivalent to Snap's face mesh SDK. Combined with **Snap Lens Studio + Camera Kit** (also free for developers), you have two world-class AR platforms at zero SDK licensing cost.

### Google vs Snap AR SDK Comparison

| Capability | Google MediaPipe | Snap Camera Kit + Lens Studio |
|---|---|---|
| 3D Face Mesh | 478 landmarks, free | 3D face mesh, free |
| Web Support | Yes (JS/WASM) | Yes (Web SDK) |
| AR Lens Creation | N/A (code-based) | Visual editor (Lens Studio) |
| Commercial License | Apache 2.0 (free forever) | Free for developers |
| Per-use API cost | $0 | $0 |
| Clinical-grade PD/measurement | Via Gemini API (pay-as-you-go) | Not built-in |

**Key insight**: Both SDKs are completely free. The only costs are:
1. **Google Gemini API** for AI analysis (pay-as-you-go, covered in existing analysis)
2. **Development** (one-off) and **Maintenance** (quarterly)

## What I'll Generate

An updated stakeholder PDF at `/mnt/documents/mh-platform-cost-analysis-v2.pdf` that combines:

### Section 1: Executive Summary
- The entire AI + AR platform runs on free SDKs with no subscriptions
- Only costs: one-off development + quarterly maintenance + pay-as-you-go AI usage

### Section 2: Technology Stack (Simple Terms)
- Google MediaPipe = face tracking engine (free)
- Snap Lens Studio = AR effects/try-on engine (free)
- Google Gemini API = AI brain for measurements & image generation (pay-as-you-go)

### Section 3: What's Included in Development (₦950,000 One-Off)
- Live AR Virtual Try-On with 3D face tracking
- AI-powered product image generation (2,000 images)
- Clinical-grade PD & facial measurement
- Eye condition screening module
- Full integration with M&H Eyewear platform

### Section 4: Google Cloud AI Usage (Pay-As-You-Go)
- Carried forward from v1 analysis: ~$200 bulk + ~$40/month ongoing
- Recommendation: Load $500–$1,000, monitor spend

### Section 5: Quarterly Maintenance & Support (₦350,000/quarter)
- Platform updates and bug fixes
- New lens/AR effect development
- AI model tuning and monitoring
- Security patches and performance optimization

### Section 6: Total Cost Summary Table
| Item | Type | Amount |
|---|---|---|
| Platform Development | One-off | ₦950,000 |
| Google Cloud AI (initial load) | One-off | $500–$1,000 |
| Quarterly Maintenance | Recurring | ₦350,000/quarter |
| SDK Licensing | — | ₦0 (Free) |
| Subscriptions | — | ₦0 (None required) |

### Section 7: Year 1 Total Projection
- Development: ₦950,000
- AI Usage: ~$500 (~₦800,000 at ₦1,600/$)
- Maintenance (4 quarters): ₦1,400,000
- **Year 1 Total: ~₦3,150,000** (no hidden costs, no subscriptions)

## Technical Approach
Python + ReportLab branded PDF with M&H Ink/Cream palette, clean tables, and a simple cost chart. No mention of Lovable anywhere.

