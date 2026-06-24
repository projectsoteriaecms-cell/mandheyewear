import {
  Section,
  Row,
  Column,
  Text,
  Button,
  Heading,
  Hr,
} from "@react-email/components";
import { BaseLayout, BRAND_COLORS } from "./BaseLayout";

interface AppointmentReminderEmailProps {
  recipientName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  practitionerName?: string;
  location: string;
  rescheduleLink: string;
  confirmLink: string;
}

export function AppointmentReminderEmail({
  recipientName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  practitionerName,
  location,
  rescheduleLink,
  confirmLink,
}: AppointmentReminderEmailProps) {
  return (
    <BaseLayout previewText={`Reminder: Your ${appointmentType} appointment on ${appointmentDate}`}>
      {/* Appointment Header */}
      <Section style={styles.headerSection}>
        <Row>
          <Column align="center">
            <Heading style={styles.heading}>
              Appointment Reminder
            </Heading>
            <Text style={styles.subheading}>
              We look forward to seeing you!
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Greeting */}
      <Section style={styles.section}>
        <Row>
          <Column>
            <Text style={styles.greeting}>
              Hi {recipientName},
            </Text>
            <Text style={styles.body}>
              This is a reminder about your upcoming appointment with M&H Eyewear & Opticals.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Appointment Details Card */}
      <Section style={styles.detailsCard}>
        <Row>
          <Column style={styles.detailsContent}>
            <table style={styles.detailsTable}>
              <tbody>
                <tr style={styles.detailRow}>
                  <td style={styles.detailLabel}>📅 Date:</td>
                  <td style={styles.detailValue}>{appointmentDate}</td>
                </tr>
                <tr style={styles.detailRow}>
                  <td style={styles.detailLabel}>🕐 Time:</td>
                  <td style={styles.detailValue}>{appointmentTime}</td>
                </tr>
                <tr style={styles.detailRow}>
                  <td style={styles.detailLabel}>👁️ Service:</td>
                  <td style={styles.detailValue}>{appointmentType}</td>
                </tr>
                {practitionerName && (
                  <tr style={styles.detailRow}>
                    <td style={styles.detailLabel}>👤 Practitioner:</td>
                    <td style={styles.detailValue}>{practitionerName}</td>
                  </tr>
                )}
                <tr style={styles.detailRow}>
                  <td style={styles.detailLabel}>📍 Location:</td>
                  <td style={styles.detailValue}>{location}</td>
                </tr>
              </tbody>
            </table>
          </Column>
        </Row>
      </Section>

      {/* Important Info */}
      <Section style={styles.infoSection}>
        <Row>
          <Column>
            <Text style={styles.infoTitle}>
              ⏰ Please arrive 10-15 minutes early
            </Text>
            <Text style={styles.infoText}>
              This allows us to complete any necessary paperwork and ensure we start on time.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Actions */}
      <Section style={styles.actionsSection}>
        <Row>
          <Column style={styles.actionColumn}>
            <Button
              style={{
                ...styles.button,
                backgroundColor: BRAND_COLORS.accent,
                color: BRAND_COLORS.primary,
              }}
              href={confirmLink}
            >
              ✓ Confirm Appointment
            </Button>
          </Column>
          <Column style={styles.actionColumn}>
            <Button
              style={{
                ...styles.button,
                backgroundColor: "transparent",
                color: BRAND_COLORS.accent,
                border: `2px solid ${BRAND_COLORS.accent}`,
              }}
              href={rescheduleLink}
            >
              📅 Reschedule
            </Button>
          </Column>
        </Row>
      </Section>

      <Hr style={{ borderColor: BRAND_COLORS.accent, margin: "30px 0" }} />

      {/* Contact Info */}
      <Section style={styles.section}>
        <Row>
          <Column>
            <Text style={styles.contactTitle}>
              Need to make changes?
            </Text>
            <Text style={styles.contactText}>
              Call us at <strong>+234 XXX XXXX XXXX</strong> or reply to this email.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Closing */}
      <Section style={styles.section}>
        <Row>
          <Column>
            <Text style={styles.closingText}>
              We're excited to help you see better!
              <br />
              <strong style={{ color: BRAND_COLORS.accent }}>
                M&H Eyewear & Opticals Team
              </strong>
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
  subheading: {
    color: BRAND_COLORS.accent,
    fontSize: "16px",
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
  body: {
    fontSize: "14px",
    color: BRAND_COLORS.lightText,
    lineHeight: "1.6",
    margin: "0",
  },
  detailsCard: {
    backgroundColor: BRAND_COLORS.background,
    padding: "30px 20px",
    borderLeft: `4px solid ${BRAND_COLORS.accent}`,
  },
  detailsContent: {
    padding: "0",
  },
  detailsTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  detailRow: {
    padding: "12px 0",
    borderBottom: `1px solid #E0E0E0`,
  },
  detailLabel: {
    fontSize: "14px",
    fontWeight: "bold",
    color: BRAND_COLORS.accent,
    paddingRight: "20px",
    verticalAlign: "top" as const,
  },
  detailValue: {
    fontSize: "14px",
    color: BRAND_COLORS.text,
  },
  infoSection: {
    padding: "30px 20px",
    backgroundColor: `${BRAND_COLORS.accent}15`,
    borderRadius: "8px",
    margin: "20px",
  },
  infoTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: BRAND_COLORS.primary,
    margin: "0 0 10px 0",
  },
  infoText: {
    fontSize: "13px",
    color: BRAND_COLORS.text,
    lineHeight: "1.6",
    margin: "0",
  },
  actionsSection: {
    padding: "30px 20px",
    textAlign: "center" as const,
  },
  actionColumn: {
    padding: "10px",
  },
  button: {
    padding: "12px 30px",
    fontSize: "14px",
    fontWeight: "bold",
    textDecoration: "none",
    borderRadius: "6px",
    display: "inline-block",
    textAlign: "center" as const,
  },
  contactTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: BRAND_COLORS.text,
    margin: "0 0 10px 0",
  },
  contactText: {
    fontSize: "13px",
    color: BRAND_COLORS.lightText,
    lineHeight: "1.6",
    margin: "0",
  },
  closingText: {
    fontSize: "14px",
    color: BRAND_COLORS.text,
    lineHeight: "1.6",
    margin: "0",
  },
};
