export { BaseLayout, BRAND_COLORS } from "./BaseLayout";
export type { } from "./BaseLayout";

export { CampaignEmail } from "./CampaignEmail";
export type { CampaignEmailProps } from "./CampaignEmail";

export { AppointmentReminderEmail } from "./AppointmentReminderEmail";
export type { AppointmentReminderEmailProps } from "./AppointmentReminderEmail";

export { NewsletterEmail } from "./NewsletterEmail";
export type { NewsletterEmailProps } from "./NewsletterEmail";

/**
 * Email template library for M&H Eyewear & Opticals
 *
 * Usage:
 * 1. Import the template you need
 * 2. Pass the required props
 * 3. Render with React Email
 * 4. Send via Resend API
 *
 * Example:
 * ```tsx
 * import { CampaignEmail } from "@/modules/crm/email-templates";
 * import { render } from "@react-email/render";
 *
 * const email = (
 *   <CampaignEmail
 *     campaignName="Summer Sale"
 *     subject="50% Off This Summer!"
 *     heroText="Limited Time Offer"
 *     mainContent="<p>Get 50% off all frames this summer</p>"
 *     ctaText="Shop Now"
 *     ctaLink="https://mandheyewear.com/shop"
 *     recipientName="John"
 *   />
 * );
 *
 * const html = render(email);
 * // Send with Resend API
 * ```
 */
