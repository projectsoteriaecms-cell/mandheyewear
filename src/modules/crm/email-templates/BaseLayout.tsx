import {
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Hr,
  Font,
} from "@react-email/components";

const COLORS = {
  primary: "#0F1B2E",      // Navy blue
  accent: "#D4AF37",       // Gold
  text: "#333333",
  lightText: "#666666",
  background: "#F5F5F5",
  white: "#FFFFFF",
};

interface BaseLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export function BaseLayout({ children, previewText }: BaseLayoutProps) {
  return (
    <Container style={styles.container}>
      <Font
        fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
        fallbackFontFamily="sans-serif"
      />

      {/* Header with Logo */}
      <Section style={styles.header}>
        <Row>
          <Column align="center">
            <Text style={styles.logo}>
              👁️ <span style={{ color: COLORS.accent, fontWeight: "bold" }}>M&H</span>
            </Text>
            <Text style={styles.logoSubtitle}>EYEWEAR & OPTICALS</Text>
          </Column>
        </Row>
      </Section>

      {/* Content */}
      <Section style={styles.content}>
        {children}
      </Section>

      {/* Footer */}
      <Hr style={styles.divider} />
      <Section style={styles.footer}>
        <Row>
          <Column align="center">
            <Text style={styles.footerText}>
              © 2026 M&H Eyewear & Opticals. All rights reserved.
            </Text>
            <Text style={styles.footerLinks}>
              <Link href="https://mandheyewear.com" style={styles.link}>
                Website
              </Link>
              {" • "}
              <Link href="mailto:contact@mandheyewear.com" style={styles.link}>
                Contact
              </Link>
              {" • "}
              <Link href="https://mandheyewear.com/unsubscribe" style={styles.link}>
                Unsubscribe
              </Link>
            </Text>
          </Column>
        </Row>
      </Section>
    </Container>
  );
}

const styles = {
  container: {
    backgroundColor: COLORS.background,
    fontFamily: "Segoe UI, Tahoma, Geneva, sans-serif",
    margin: "0 auto",
    padding: "20px 0",
    width: "100%",
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: "40px 20px",
    textAlign: "center" as const,
  },
  logo: {
    color: COLORS.accent,
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0 0 10px 0",
  },
  logoSubtitle: {
    color: COLORS.accent,
    fontSize: "14px",
    letterSpacing: "2px",
    margin: "0",
  },
  content: {
    backgroundColor: COLORS.white,
    padding: "40px 20px",
  },
  divider: {
    borderColor: COLORS.accent,
    margin: "20px 0",
  },
  footer: {
    backgroundColor: COLORS.primary,
    padding: "30px 20px",
    textAlign: "center" as const,
  },
  footerText: {
    color: COLORS.accent,
    fontSize: "12px",
    margin: "0 0 10px 0",
  },
  footerLinks: {
    fontSize: "11px",
    margin: "0",
  },
  link: {
    color: COLORS.accent,
    textDecoration: "none",
  },
};

export const BRAND_COLORS = COLORS;
