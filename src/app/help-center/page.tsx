import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Get answers to common questions about creating MemoryPops, inviting contributors, and managing your celebrations.',
  openGraph: {
    title: 'Help Center | MemoryPop',
    description: 'Get answers to common questions about creating MemoryPops, inviting contributors, and managing your celebrations.',
    url: '/help-center',
  },
};

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Help Center</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Answers to common questions
          </p>
        </div>

        {/* FAQs */}
        <div className="mt-12 space-y-10">
          {/* FAQ 1 */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">How do I create a MemoryPop?</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Click "Create Your MemoryPop" on the homepage, choose an occasion, add a personal message,
              and give your MemoryPop a name. You'll get a unique link to share with contributors and a
              creator dashboard link emailed to you.
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">How do contributors add memories?</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Share your MemoryPop link with anyone you want to include. They click the link, write their message,
              optionally upload a photo, choose an emoji, and submit. No signup required.
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Can I edit my MemoryPop after creating it?</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Yes. Access your creator dashboard using the link sent to your email. From there, you can edit
              your personal message, update the occasion, or change the MemoryPop name.
            </p>
          </div>

          {/* FAQ 4 */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">How do I access my creator dashboard?</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Check your email for the creator dashboard link (sent when you create your MemoryPop). You can also
              access it by entering your email on the homepage if you've lost the link.
            </p>
          </div>

          {/* FAQ 5 */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Can contributors add photos?</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Yes. Contributors can upload one photo per memory. We support JPEG, PNG, and HEIC formats.
              Photos are automatically optimized for web viewing.
            </p>
          </div>

          {/* FAQ 6 */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Is MemoryPop free?</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Yes. Creating a MemoryPop and collecting memories is completely free. We may offer premium features
              (like physical keepsake books) in the future, but the core experience will always be free.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-xl font-semibold">Still have questions?</p>
          <p className="mt-4 text-base text-muted-foreground">
            <Link href="/contact" className="underline hover:text-foreground">Contact us</Link>
            {' '}— we're happy to help.
          </p>
        </div>
      </div>
    </main>
  );
}
