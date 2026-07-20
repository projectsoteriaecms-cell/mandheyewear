/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token?: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  token,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your M&H Eyewear verification code{token ? `: ${token}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://www.mandheyewear.com/pwa-192x192.png"
            width="72"
            height="72"
            alt="M&H Eyewear"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Welcome aboard</Heading>
        <Text style={text}>
          Thanks for joining{' '}
          <Link href={siteUrl} style={link}>
            <strong>M&H Eyewear</strong>
          </Link>
          . Enter this code on the verification screen to activate your account:
        </Text>

        {token ? (
          <Section style={codeSection}>
            <Text style={codeText}>{token}</Text>
          </Section>
        ) : null}

        <Text style={text}>
          Or simply tap the button below — it does the same thing:
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Verify My Email
          </Button>
        </Section>
        <Text style={footer}>
          This code expires in 24 hours. If you didn't create an account, you can safely ignore
          this email.
        </Text>
        <Text style={brand}>
          M&H Eyewear — See Better. Look Better.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const link = { color: 'hsl(210, 85%, 40%)', textDecoration: 'underline' }
const codeSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '20px',
  backgroundColor: 'hsl(210, 40%, 96%)',
  borderRadius: '12px',
}
const codeText = {
  fontFamily: "'Courier New', monospace",
  fontSize: '34px',
  fontWeight: '700' as const,
  letterSpacing: '10px',
  color: 'hsl(210, 25%, 12%)',
  margin: '0',
}
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = {
  backgroundColor: 'hsl(210, 85%, 40%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 32px',
  textDecoration: 'none',
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
