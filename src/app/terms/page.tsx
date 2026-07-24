import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'MemoryPop\'s terms of service explain the rules and guidelines for using our platform.',
  openGraph: {
    title: 'Terms of Service | MemoryPop',
    description: 'MemoryPop\'s terms of service explain the rules and guidelines for using our platform.',
    url: '/terms',
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: July 24, 2026
          </p>
        </div>

        {/* Content */}
        <div className="mt-12 space-y-8 text-base leading-relaxed">
          {/* Acceptance */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using MemoryPop, you agree to be bound by these Terms of Service and our Privacy Policy.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          {/* Description of Service */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground">
              MemoryPop is a digital platform that helps you create collaborative memory books for celebrations.
              You can create a MemoryPop, invite contributors to add memories, and share the completed collection
              with your recipient.
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. User Responsibilities</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>When using MemoryPop, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Provide accurate information when creating your MemoryPop</li>
                <li>Respect the privacy and rights of others</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not upload content you don't have the right to share</li>
                <li>Not impersonate others or misrepresent your identity</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Uses */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Prohibited Uses</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>You may not use MemoryPop to:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Post illegal, harmful, threatening, abusive, or offensive content</li>
                <li>Harass, stalk, or threaten others</li>
                <li>Spam or send unsolicited communications</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the service</li>
              </ul>
            </div>
          </section>

          {/* Content Ownership */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Content Ownership</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Your Content:</strong> You retain all ownership rights to the content you and your contributors submit to MemoryPop.</p>
              <p><strong className="text-foreground">License to Us:</strong> By using MemoryPop, you grant us a license to store, display, and process your content solely for the purpose of providing our service to you.</p>
              <p><strong className="text-foreground">Our Content:</strong> The MemoryPop service, including its design, features, and functionality, is owned by us and protected by copyright and other intellectual property laws.</p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              MemoryPop is provided "as is" and "as available" without warranties of any kind, either express or implied.
              We do not guarantee that the service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, MemoryPop shall not be liable for any indirect, incidental,
              special, or consequential damages arising out of or related to your use of the service, including
              but not limited to loss of data, loss of profits, or loss of memories.
            </p>
          </section>

          {/* Termination */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Termination</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We reserve the right to suspend or terminate your access to MemoryPop at any time for:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Violation of these Terms of Service</li>
                <li>Conduct that harms MemoryPop or other users</li>
                <li>Any other reason at our sole discretion</li>
              </ul>
              <p className="mt-3">You may stop using MemoryPop at any time. You may request deletion of your data by contacting us.</p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms of Service from time to time. We will notify you of any material changes
              by posting the new Terms on this page and updating the "Last updated" date. Your continued use of
              MemoryPop after changes are posted constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
              in which MemoryPop operates, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms of Service, please contact us:
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
