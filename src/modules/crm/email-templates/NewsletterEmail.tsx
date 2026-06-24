import {
  Section,
  Row,
  Column,
  Text,
  Button,
  Heading,
  Link,
} from "@react-email/components";
import { BaseLayout, BRAND_COLORS } from "./BaseLayout";

interface NewsletterArticle {
  title: string;
  excerpt: string;
  link: string;
  image?: string;
}

interface NewsletterEmailProps {
  newsletterTitle: string;
  monthYear: string;
  recipientName?: string;
  introduction: string;
  articles: NewsletterArticle[];
  featuredTitle?: string;
  featuredContent?: string;
  featuredImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function NewsletterEmail({
  newsletterTitle,
  monthYear,
  recipientName,
  introduction,
  articles,
  featuredTitle,
  featuredContent,
  featuredImage,
  ctaText = "Learn More",
  ctaLink = "https://mandheyewear.com",
}: NewsletterEmailProps) {
  return (
    <BaseLayout previewText={`${newsletterTitle} - ${monthYear}`}>
      {/* Newsletter Header */}
      <Section style={styles.headerSection}>
        <Row>
          <Column align="center">
            <Heading style={styles.heading}>
              {newsletterTitle}
            </Heading>
            <Text style={styles.monthYear}>{monthYear}</Text>
          </Column>
        </Row>
      </Section>

      {/* Greeting */}
      {recipientName && (
        <Section style={styles.section}>
          <Row>
            <Column>
              <Text style={styles.greeting}>
                Hi {recipientName},
              </Text>
            </Column>
          </Row>
        </Section>
      )}

      {/* Introduction */}
      <Section style={styles.section}>
        <Row>
          <Column>
            <Text
              style={{
                fontSize: "15px",
                color: BRAND_COLORS.text,
                lineHeight: "1.6",
                margin: "0",
              }}
            >
              {introduction}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Featured Article */}
      {featuredTitle && (
        <>
          <Section style={styles.featuredSection}>
            {featuredImage && (
              <Row>
                <Column>
                  <img
                    src={featuredImage}
                    alt={featuredTitle}
                    style={styles.featuredImage}
                  />
                </Column>
              </Row>
            )}
            <Row style={{ marginTop: "20px" }}>
              <Column style={{ padding: "20px" }}>
                <Heading style={styles.featuredTitle}>
                  {featuredTitle}
                </Heading>
                <Text
                  style={{
                    fontSize: "14px",
                    color: BRAND_COLORS.text,
                    lineHeight: "1.6",
                    margin: "15px 0",
                  }}
                >
                  {featuredContent}
                </Text>
                <Button
                  style={{
                    ...styles.button,
                    backgroundColor: BRAND_COLORS.accent,
                    color: BRAND_COLORS.primary,
                  }}
                  href={ctaLink}
                >
                  {ctaText}
                </Button>
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* Articles Grid */}
      <Section style={styles.articlesSection}>
        <Row>
          <Column>
            <Heading style={styles.sectionTitle}>
              In This Issue
            </Heading>
          </Column>
        </Row>

        {articles.map((article, index) => (
          <Row key={index} style={styles.articleCard}>
            {article.image && (
              <Column style={{ width: "40%", paddingRight: "15px" }}>
                <img
                  src={article.image}
                  alt={article.title}
                  style={styles.articleImage}
                />
              </Column>
            )}
            <Column>
              <Text style={styles.articleTitle}>
                {article.title}
              </Text>
              <Text style={styles.articleExcerpt}>
                {article.excerpt}
              </Text>
              <Link href={article.link} style={styles.readMoreLink}>
                Read More →
              </Link>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Eye Care Tips */}
      <Section style={styles.tipsSection}>
        <Row>
          <Column align="center">
            <Heading style={styles.tipsTitle}>
              💡 Did You Know?
            </Heading>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={styles.tipsText}>
              UV-protective eyewear can significantly reduce your risk of cataracts and other eye conditions.
              Make sure your glasses block 99-100% of UVA and UVB rays!
            </Text>
          </Column>
        </Row>
      </Section>

      {/* CTA Banner */}
      <Section style={styles.ctaBanner}>
        <Row>
          <Column align="center">
            <Heading style={styles.ctaBannerTitle}>
              Need an Eye Exam?
            </Heading>
            <Text style={styles.ctaBannerText}>
              Book your appointment with our expert optometrists today!
            </Text>
            <Button
              style={{
                ...styles.button,
                backgroundColor: BRAND_COLORS.primary,
                color: BRAND_COLORS.accent,
              }}
              href="https://mandheyewear.com/book-appointment"
            >
              Book Now
            </Button>
          </Column>
        </Row>
      </Section>

      {/* Social Links */}
      <Section style={styles.socialSection}>
        <Row>
          <Column align="center">
            <Text style={styles.socialTitle}>Follow Us</Text>
            <Text style={styles.socialLinks}>
              <Link href="https://facebook.com/mandheyewear" style={styles.socialLink}>
                Facebook
              </Link>
              {" • "}
              <Link href="https://instagram.com/mandheyewear" style={styles.socialLink}>
                Instagram
              </Link>
              {" • "}
              <Link href="https://twitter.com/mandheyewear" style={styles.socialLink}>
                Twitter
              </Link>
            </Text>
          </Column>
        </Row>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  headerSection: {
    backgroundColor: BRAND_COLORS.primary,
    padding: "40px 20px",
    textAlign: "center" as const,
  },
  heading: {
    color: BRAND_COLORS.accent,
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 0 10px 0",
  },
  monthYear: {
    color: BRAND_COLORS.accent,
    fontSize: "14px",
    letterSpacing: "2px",
    margin: "0",
  },
  section: {
    padding: "30px 20px",
  },
  greeting: {
    fontSize: "16px",
    fontWeight: "bold",
    color: BRAND_COLORS.text,
    margin: "0 0 15px 0",
  },
  featuredSection: {
    backgroundColor: BRAND_COLORS.background,
    padding: "20px",
    borderRadius: "8px",
    margin: "20px",
  },
  featuredImage: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
    display: "block",
  },
  featuredTitle: {
    color: BRAND_COLORS.accent,
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0",
  },
  button: {
    padding: "12px 30px",
    fontSize: "14px",
    fontWeight: "bold",
    textDecoration: "none",
    borderRadius: "6px",
    display: "inline-block",
    marginTop: "15px",
  },
  articlesSection: {
    padding: "40px 20px",
  },
  sectionTitle: {
    color: BRAND_COLORS.accent,
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0 30px 0",
  },
  articleCard: {
    padding: "20px 0",
    borderBottom: `1px solid ${BRAND_COLORS.background}`,
  },
  articleImage: {
    width: "100%",
    height: "auto",
    borderRadius: "6px",
    display: "block",
  },
  articleTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: BRAND_COLORS.text,
    margin: "0 0 10px 0",
  },
  articleExcerpt: {
    fontSize: "13px",
    color: BRAND_COLORS.lightText,
    lineHeight: "1.6",
    margin: "0 0 12px 0",
  },
  readMoreLink: {
    fontSize: "12px",
    color: BRAND_COLORS.accent,
    fontWeight: "bold",
    textDecoration: "none",
  },
  tipsSection: {
    backgroundColor: `${BRAND_COLORS.accent}15`,
    padding: "30px 20px",
    margin: "20px",
    borderRadius: "8px",
    textAlign: "center" as const,
  },
  tipsTitle: {
    color: BRAND_COLORS.primary,
    fontSize: "18px",
    margin: "0 0 15px 0",
  },
  tipsText: {
    fontSize: "14px",
    color: BRAND_COLORS.text,
    lineHeight: "1.6",
    margin: "0",
  },
  ctaBanner: {
    backgroundColor: BRAND_COLORS.primary,
    padding: "40px 20px",
    textAlign: "center" as const,
  },
  ctaBannerTitle: {
    color: BRAND_COLORS.accent,
    fontSize: "22px",
    margin: "0 0 10px 0",
  },
  ctaBannerText: {
    color: BRAND_COLORS.accent,
    fontSize: "14px",
    margin: "0 0 20px 0",
  },
  socialSection: {
    padding: "30px 20px",
    textAlign: "center" as const,
  },
  socialTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: BRAND_COLORS.text,
    margin: "0 0 10px 0",
  },
  socialLinks: {
    fontSize: "13px",
    margin: "0",
  },
  socialLink: {
    color: BRAND_COLORS.accent,
    textDecoration: "none",
    fontWeight: "bold",
  },
};
