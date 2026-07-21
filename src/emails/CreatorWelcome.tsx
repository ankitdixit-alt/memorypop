/**
 * Creator Welcome Email Template
 * Private Beta: Optional Email Convenience Feature
 *
 * Sends creator their Private Creator Link, contributor link, and MemoryPop details
 * Uses warm, celebratory tone - not technical or verification-focused
 *
 * Security: Includes management token in link. Clear warnings about keeping link private.
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
  Hr,
} from "@react-email/components";

interface CreatorWelcomeEmailProps {
  recipientName: string;
  occasion: string;
  celebrationDate: string | null;
  celebrationMessage: string | null;
  createdAt: string;
  managementLink: string;
  contributorLink: string;
}

export default function CreatorWelcomeEmail({
  recipientName,
  occasion,
  celebrationDate,
  celebrationMessage,
  createdAt,
  managementLink,
  contributorLink,
}: CreatorWelcomeEmailProps) {
  // Format dates for display
  const celebrationDateFormatted = celebrationDate
    ? new Date(celebrationDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  const createdDateFormatted = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Html>
      <Head />
      <Preview>Your MemoryPop for {recipientName} is ready 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Celebratory Header */}
          <Section style={header}>
            <Text style={emoji}>🎉</Text>
            <Heading style={h1}>You created something special!</Heading>
          </Section>

          {/* Greeting */}
          <Text style={text}>
            You&apos;ve created a MemoryPop for <strong>{recipientName}&apos;s {occasion}</strong>.
          </Text>

          {/* MemoryPop Details */}
          <Section style={detailsBox}>
            <Heading style={h2}>Your MemoryPop</Heading>
            <table style={detailsTable}>
              <tbody>
                <tr>
                  <td style={detailsLabel}>Recipient:</td>
                  <td style={detailsValue}>{recipientName}</td>
                </tr>
                <tr>
                  <td style={detailsLabel}>Occasion:</td>
                  <td style={detailsValue}>{occasion}</td>
                </tr>
                {celebrationDateFormatted && celebrationMessage && (
                  <tr>
                    <td style={detailsLabel}>Celebration:</td>
                    <td style={detailsValue}>
                      {celebrationDateFormatted}
                      <br />
                      <span style={detailsSubtext}>({celebrationMessage})</span>
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={detailsLabel}>Created:</td>
                  <td style={detailsValue}>{createdDateFormatted}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={divider} />

          {/* Private Creator Link */}
          <Section style={section}>
            <Heading style={h2}>🔒 Your Private Creator Link</Heading>
            <Text style={text}>
              Use this link anytime to manage your MemoryPop:
            </Text>
            <Button style={buttonPrimary} href={managementLink}>
              View Creator Dashboard
            </Button>
            <Text style={urlText}>
              {managementLink}
            </Text>
            <Section style={warningBox}>
              <Text style={warningText}>
                <strong>⚠️ Keep this link private.</strong>
                <br />
                Anyone with this link can manage your MemoryPop.
                <br />
                Save it in your password manager or bookmarks.
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Contributor Link */}
          <Section style={section}>
            <Heading style={h2}>🤝 Share with Contributors</Heading>
            <Text style={text}>
              Share this link with friends and family so they can add memories before the celebration:
            </Text>
            <Button style={buttonSecondary} href={contributorLink}>
              Contributor Link
            </Button>
            <Text style={urlText}>
              {contributorLink}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              💛 <strong>MemoryPop</strong>
            </Text>
            <Text style={footerText}>
              Creating celebrations worth remembering.
            </Text>
            <Text style={footerTextSmall}>
              Questions? Visit <Link href={process.env.APP_BASE_URL || "https://memorypop.app"} style={linkStyle}>memorypop.app</Link>
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

const h2 = {
  color: "#2B1E18",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const text = {
  color: "#3A241E",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const section = {
  marginTop: "24px",
  marginBottom: "24px",
};

const detailsBox = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "24px",
  marginTop: "24px",
  border: "1px solid #EAD8C9",
};

const detailsTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const detailsLabel = {
  color: "#856B5F",
  fontSize: "14px",
  fontWeight: "600",
  padding: "8px 16px 8px 0",
  verticalAlign: "top" as const,
  width: "120px",
};

const detailsValue = {
  color: "#2B1E18",
  fontSize: "16px",
  padding: "8px 0",
  verticalAlign: "top" as const,
};

const detailsSubtext = {
  color: "#856B5F",
  fontSize: "14px",
  fontStyle: "italic" as const,
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
  margin: "16px 0",
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
  margin: "16px 0",
};

const urlText = {
  color: "#856B5F",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "8px 0",
  wordBreak: "break-all" as const,
  backgroundColor: "#F5F5F5",
  padding: "8px 12px",
  borderRadius: "8px",
  fontFamily: "monospace",
};

const warningBox = {
  backgroundColor: "#FFE8E0",
  border: "2px solid #EF6A57",
  borderRadius: "12px",
  padding: "16px",
  marginTop: "16px",
};

const warningText = {
  color: "#3A241E",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

const linkStyle = {
  color: "#EF6A57",
  textDecoration: "underline",
};

const divider = {
  borderColor: "#EAD8C9",
  margin: "32px 0",
};

const footer = {
  marginTop: "40px",
  paddingTop: "24px",
  borderTop: "1px solid #EAD8C9",
  textAlign: "center" as const,
};

const footerText = {
  color: "#856B5F",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "8px 0",
};

const footerTextSmall = {
  color: "#856B5F",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "8px 0",
};
