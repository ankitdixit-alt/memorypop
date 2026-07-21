/**
 * Creation Confirmation Email Template
 * Sprint 1: Creator Email Capture & Recovery
 *
 * Sends creator both their private dashboard link and shareable contributor link
 * Uses React Email for consistent, accessible email rendering
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface CreationConfirmationEmailProps {
  recipientName: string;
  occasion: string;
  verificationLink: string;
  contributorLink: string;
}

export default function CreationConfirmationEmail({
  recipientName,
  occasion,
  verificationLink,
  contributorLink,
}: CreationConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your MemoryPop for {recipientName} is ready 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={emoji}>🎉</Text>
            <Heading style={h1}>Your MemoryPop is Ready!</Heading>
          </Section>

          {/* Greeting */}
          <Text style={text}>
            You&apos;ve created a MemoryPop for <strong>{recipientName}&apos;s {occasion}</strong>.
          </Text>

          <Text style={text}>
            To keep your MemoryPop secure, please verify your email address first.
          </Text>

          {/* Email Verification Link */}
          <Section style={section}>
            <Text style={label}>✉️ Verify Your Email</Text>
            <Text style={description}>
              Click below to verify your email and access your private creator dashboard.
            </Text>
            <Button style={buttonPrimary} href={verificationLink}>
              Verify Email & Access Dashboard
            </Button>
            <Text style={urlText}>
              Or copy this link: <Link href={verificationLink} style={linkStyle}>{verificationLink}</Link>
            </Text>
            <Text style={expiryText}>
              ⏰ This link expires in 24 hours
            </Text>
          </Section>

          {/* Contributor Sharing Link */}
          <Section style={section}>
            <Text style={label}>📢 Share This Link with Contributors</Text>
            <Text style={description}>
              Share this link with friends and family so they can add memories for {recipientName}.
            </Text>
            <Button style={buttonSecondary} href={contributorLink}>
              Contributor Link
            </Button>
            <Text style={urlText}>
              Or copy this link: <Link href={contributorLink} style={linkStyle}>{contributorLink}</Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              🛡️ For security, we require email verification before granting dashboard access. This ensures only you can manage {recipientName}&apos;s MemoryPop.
            </Text>
            <Text style={footerText}>
              Need help? Reply to this email or visit <Link href={process.env.APP_BASE_URL || "https://memorypop.app"} style={linkStyle}>memorypop.app</Link>.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#FFF8F2",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const emoji = {
  fontSize: "48px",
  lineHeight: "1",
  margin: "0 0 16px 0",
};

const h1 = {
  color: "#2B1E18",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
  lineHeight: "1.2",
};

const text = {
  color: "#3A241E",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const section = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "24px",
  marginTop: "24px",
  border: "1px solid #EAD8C9",
};

const label = {
  color: "#2B1E18",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const description = {
  color: "#6B5B52",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "8px 0 16px 0",
};

const buttonPrimary = {
  backgroundColor: "#EF6A57",
  borderRadius: "9999px",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "14px 28px",
  display: "inline-block",
  margin: "8px 0",
};

const buttonSecondary = {
  backgroundColor: "#FFFFFF",
  border: "2px solid #EF6A57",
  borderRadius: "9999px",
  color: "#EF6A57",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 28px",
  display: "inline-block",
  margin: "8px 0",
};

const urlText = {
  color: "#856B5F",
  fontSize: "12px",
  lineHeight: "1.5",
  marginTop: "12px",
  wordBreak: "break-all" as const,
};

const expiryText = {
  color: "#856B5F",
  fontSize: "12px",
  lineHeight: "1.5",
  marginTop: "12px",
  fontStyle: "italic" as const,
};

const linkStyle = {
  color: "#EF6A57",
  textDecoration: "underline",
};

const footer = {
  marginTop: "40px",
  paddingTop: "24px",
  borderTop: "1px solid #EAD8C9",
};

const footerText = {
  color: "#856B5F",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "8px 0",
};
