

# Google AI Studio — What You Need for Your Features

## Key Insight: There Is No "Yearly Subscription"

Google AI Studio / Gemini API does **not** offer annual subscriptions. It works on a **pay-as-you-go** (usage-based) model with tiered rate limits. You simply enable billing on a Google Cloud project and pay only for what you use.

## What Your Features Require

| Feature | Model Used | Capability Needed |
|---|---|---|
| **Photo Try-On** (product image generation + VTO overlay) | `gemini-2.5-flash-image` | Image generation (output) |
| **Live/Web AR Try-On** | Snap Camera Kit (already integrated) | No Gemini API needed |
| **Face Measurement & PD** | `gemini-2.5-flash` (vision) | Image understanding (input) |
| **Personalization scoring** | Client-side logic | No API needed |

The **Live AR Try-On** already uses Snap Camera Kit — it does not use Gemini at all. Face measurement and PD use Gemini's **vision/understanding** capabilities (analyzing an image), which are available even on the free tier. The bottleneck is **image generation** (Photo Try-On and product gallery), which requires the **Paid Tier**.

## How to Set It Up

### Step 1: Enable Billing (Paid Tier — "Tier 1")
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click your profile → **Billing** → **Enable billing**
3. Link or create a Google Cloud billing account (add a credit card)
4. This automatically upgrades you to **Tier 1**

### Step 2: Estimated Costs

| Usage | Cost per image | Monthly estimate |
|---|---|---|
| Product gallery generation (6 shots × N products) | ~$0.07/image | One-time batch — e.g. 200 products × 6 = 1,200 images ≈ **$84** |
| Photo try-on per customer | ~$0.07/image | 500 customers/month ≈ **$35** |
| Face analysis (vision, not generation) | ~$0.001/call | Negligible |

**Rough total: $50–150/month** depending on volume, with no commitment or subscription.

### Tier Rate Limits

| Tier | How to reach it | RPM | RPD |
|---|---|---|---|
| Free | Default | 15 | 1,000 (but 0 for image gen) |
| Tier 1 | Enable billing | 500 | 10,000 |
| Tier 2 | ~$250 spend history | 2,000 | Unlimited |

Tier 1 is sufficient for your use case. You auto-graduate to Tier 2 after ~$250 cumulative spend.

## Recommendation

**Enable billing on your existing Google Cloud project** (the one linked to your current Gemini API key). There is no annual plan to buy — just pay-as-you-go. Once billing is active, the 429 errors on image generation will stop immediately, and the direct Gemini API path will work without falling back to Lovable AI credits.

## No Code Changes Needed

This is purely an account configuration step on Google's side. The edge function already has the correct model (`gemini-2.5-flash-image`) and fallback logic in place.

