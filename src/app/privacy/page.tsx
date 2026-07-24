import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'MemoryPop\'s privacy policy explains how we collect, use, and protect your data.',
  openGraph: {
    title: 'Privacy Policy | MemoryPop',
    description: 'MemoryPop\'s privacy policy explains how we collect, use, and protect your data.',
    url: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: July 24, 2026
          </p>
        </div>

        {/* Content */}
        <div className="mt-12 space-y-8 text-base leading-relaxed">
          {/* Introduction */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p className="text-muted-foreground">
              MemoryPop ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, and protect your personal information when you use our service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Creator Information:</strong> When you create a MemoryPop, we collect your email address to send you your creator dashboard link.</p>
              <p><strong className="text-foreground">Contributor Submissions:</strong> We collect and store the memories, messages, photos, and other content that contributors submit to your MemoryPop.</p>
              <p><strong className="text-foreground">Usage Data:</strong> We collect information about how you use our service, including pages visited, features used, and technical information like your browser type and IP address.</p>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Provide and maintain our service</li>
                <li>Send you important service notifications and your creator dashboard link</li>
                <li>Improve and optimize our service</li>
                <li>Respond to your questions and support requests</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
            </div>
          </section>

          {/* Data Storage and Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Storage and Security</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Your data is stored securely using industry-standard encryption and security practices. We use trusted third-party services including Supabase for database storage and Cloudinary for image storage.</p>
              <p>While we implement robust security measures, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but we work continuously to protect your information.</p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Rights</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate data</li>
                <li><strong className="text-foreground">Deletion:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong className="text-foreground">Portability:</strong> Request your data in a portable format</li>
                <li><strong className="text-foreground">Objection:</strong> Object to certain types of data processing</li>
              </ul>
              <p className="mt-3">To exercise these rights, please contact us at <a href="mailto:support@memorypop.com" className="text-primary hover:underline">support@memorypop.com</a></p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as your MemoryPop exists or as needed to provide our service.
              You can request deletion of your MemoryPop and associated data at any time by contacting us.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our service is not directed to children under 13. We do not knowingly collect personal information
              from children under 13. If you believe we have collected information from a child under 13, please
              contact us immediately.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any material changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          {/* Contact Us */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-muted-foreground">
              Email: <a href="mailto:support@memorypop.com" className="text-primary hover:underline">support@memorypop.com</a>
            </p>
            <p className="text-muted-foreground">
              Or visit our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
