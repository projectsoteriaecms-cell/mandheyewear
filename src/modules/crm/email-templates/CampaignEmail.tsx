import {
  Section,
  Row,
  Column,
  Text,
  Button,
  Heading,
} from "@react-email/components";
import { BaseLayout, BRAND_COLORS } from "./BaseLayout";

interface CampaignEmailProps {
  campaignName: string;
  subject: string;
  previewText?: string;
  heroText: string;
  heroImage?: string;
  mainContent: string;
  ctaText: string;
  ctaLink: string;
  recipientName?: string;
}

export function CampaignEmail({
  campaignName,
  subject,
  previewText,
  heroText,
  heroImage,
  mainContent,
  ctaText,
  ctaLink,
  recipientName,
}: CampaignEmailProps) {
  return (
    <BaseLayout previewText={previewText || subject}>
      {/* Hero Section */}
      {heroImage && (
        <Section style={styles.heroSection}>
          <Row>
            <Column>
              <img
                src={heroImage}
                alt={subject}
                style={styles.heroImage}
              />
            </Column>
          </Row>
        </Section>
      )}

      {/* Hero Text */}
      <Section style={styles.heroTextSection}>
        <Row>
          <Column align="center">
            <Heading style={styles.heroTitle}>{heroText}</Heading>
          </Column>
        </Row>
      </Section>

      {/* Greeting */}
      {recipientName && (
        <Section style={styles.section}>
          <Row>
            <Column>
              <Text style={styles.greeting}>
                Hello {recipientName},
              </Text>
            </Column>
          </Row>
        </Section>
      )}

      {/* Main Content */}
      <Section style={styles.section}>
        <Row>
          <Column>
            <div
              style={{
                fontSize: "16px",
                lineHeight: "1.6",
                color: BRAND_COLORS.text,
              }}
              dangerouslySetInnerHTML={{ __html: mainContent }}
            />
          </Column>
        </Row>
      </Section>

      {/* CTA Button */}
      <Section style={styles.ctaSection}>
        <Row>
          <Column align="center">
            <Button
              pxSize={20}
              style={{
                backgroundColor: BRAND_COLORS.accent,
                color: BRAND_COLORS.primary,
                fontSize: "16px",
                fontWeight: "bold",
                textDecoration: "none",
                borderRadius: "6px",
                padding: "14px 40px",
                display: "inline-block",
              }}
              href={ctaLink}
            >
              {ctaText}
            </Button>
          </Column>
        </Row>
      </Section>

      {/* Closing */}
      <Section style={styles.section}>
        <Row>
          <Column>
            <Text style={styles.closingText}>
              Best regards,
              <br />
              <strong style={{ color: BRAND_COLORS.accent }}>
                M&H Eyewear & Opticals Team
              </strong>
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Benefits Section */}
      <Section style={styles.benefitsSection}>
        <Row>
          <Column style={styles.benefitColumn}>
            <Text style={styles.benefitIcon}>👓</Text>
            <Text style={styles.benefitTitle}>Premium Frames</Text>
            <Text style={styles.benefitText}>
              Designer eyewear curated for style
            </Text>
          </Column>
          <Column style={styles.benefitColumn}>
            <Text style={styles.benefitIcon}>👁️</Text>
            <Text style={styles.benefitTitle}>Expert Care</Text>
            <Text style={styles.benefitText}>
              Professional eye care services
            </Text>
          </Column>
          <Column style={styles.benefitColumn}>
            <Text style={styles.benefitIcon}>✨</Text>
            <Text style={styles.benefitTitle}>Quality Service</Text>
            <Text style={styles.benefitText}>
              Excellence in every interaction
            </Text>
          </Column>
        </Row>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heroSection: {
    padding: "0",
    margin: "0",
  },
  heroImage: {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: "8px",
  },
  heroTextSection: {
    backgroundColor: BRAND_COLORS.primary,
    padding: "40px 20px",
    textAlign: "center" as const,
  },
  heroTitle: {
    color: BRAND_COLORS.accent,
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0",
    lineHeight: "1.3",
  },
  section: {
    padding: "30px 20px",
  },
  greeting: {
    fontSize: "16px",
    color: BRAND_COLORS.text,
    margin: "0 0 20px 0",
  },
  ctaSection: {
    padding: "40px 20px",
    textAlign: "center" as const,
  },
  closingText: {
    fontSize: "14px",
    color: BRAND_COLORS.text,
    lineHeight: "1.6",
    margin: "0",
  },
  benefitsSection: {
    backgroundColor: BRAND_COLORS.background,
    padding: "40px 20px",
  },
  benefitColumn: {
    textAlign: "center" as const,
    padding: "20px",
  },
  benefitIcon: {
    fontSize: "32px",
    display: "block",
    margin: "0 0 10px 0",
  },
  benefitTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: BRAND_COLORS.accent,
    margin: "0 0 8px 0",
  },
  benefitText: {
    fontSize: "13px",
    color: BRAND_COLORS.lightText,
    margin: "0",
  },
};
