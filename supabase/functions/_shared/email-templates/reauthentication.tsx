/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code for M&H Eyewear</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://ispizamxlrukxmysgyjv.supabase.co/storage/v1/object/public/email-assets/mh-logo.png"
            width="140"
            height="auto"
            alt="M&H Eyewear"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Verification code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
        <Text style={brand}>
          M&H Eyewear — See Better. Look Better.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '32px' }
const logo = { margin: '0 auto' }
const h1 = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: '28px',
  fontWeight: '600' as const,
  color: 'hsl(210, 25%, 12%)',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(210, 15%, 40%)',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: 'hsl(210, 85%, 40%)',
  textAlign: 'center' as const,
  letterSpacing: '4px',
  margin: '0 0 30px',
}
const footer = { fontSize: '13px', color: '#999999', margin: '30px 0 0' }
const brand = {
  fontSize: '12px',
  color: 'hsl(45, 100%, 45%)',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontStyle: 'italic' as const,
  textAlign: 'center' as const,
  margin: '16px 0 0',
}
