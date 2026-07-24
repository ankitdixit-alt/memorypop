import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact MemoryPop',
  description: 'Get in touch with the MemoryPop team for support, partnerships, or general inquiries.',
  openGraph: {
    title: 'Contact MemoryPop',
    description: 'Get in touch with the MemoryPop team for support, partnerships, or general inquiries.',
    url: '/contact',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Contact Us</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We'd love to hear from you
          </p>
        </div>

        {/* Content */}
        <div className="mt-12 space-y-12">
          {/* General Inquiries */}
          <div className="space-y-3 text-center">
            <div className="text-5xl">💬</div>
            <h2 className="text-2xl font-semibold">General Inquiries</h2>
            <p className="text-lg">
              <a
                href="mailto:hello@memorypop.com"
                className="font-medium text-primary hover:underline"
              >
                hello@memorypop.com
              </a>
            </p>
            <p className="text-base text-muted-foreground">
              For general questions, feedback, or just saying hi.
            </p>
          </div>

          {/* Support */}
          <div className="space-y-3 text-center">
            <div className="text-5xl">🆘</div>
            <h2 className="text-2xl font-semibold">Support</h2>
            <p className="text-lg">
              <a
                href="mailto:support@memorypop.com"
                className="font-medium text-primary hover:underline"
              >
                support@memorypop.com
              </a>
            </p>
            <p className="text-base text-muted-foreground">
              For technical issues, account help, or questions about your MemoryPop.
            </p>
          </div>

          {/* Partnerships */}
          <div className="space-y-3 text-center">
            <div className="text-5xl">🤝</div>
            <h2 className="text-2xl font-semibold">Partnerships & Business</h2>
            <p className="text-lg">
              <a
                href="mailto:partnerships@memorypop.com"
                className="font-medium text-primary hover:underline"
              >
                partnerships@memorypop.com
              </a>
            </p>
            <p className="text-base text-muted-foreground">
              For business inquiries, press requests, or partnership opportunities.
            </p>
          </div>

          {/* Response Time */}
          <div className="pt-8 text-center space-y-4">
            <p className="text-base text-muted-foreground">
              We aim to respond within 24-48 hours.
            </p>
            <p className="text-sm text-muted-foreground">
              Looking for quick answers?{' '}
              <Link href="/help-center" className="underline hover:text-foreground">
                Try our Help Center first
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
