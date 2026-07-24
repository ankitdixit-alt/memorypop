import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers at MemoryPop',
  description: 'We\'re not hiring today, but we\'re always interested in meeting thoughtful people building products that help people celebrate life\'s meaningful moments.',
  openGraph: {
    title: 'Careers at MemoryPop',
    description: 'We\'re not hiring today, but we\'re always interested in meeting thoughtful people building products that help people celebrate life\'s meaningful moments.',
    url: '/careers',
  },
};

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Careers at MemoryPop</h1>
        </div>

        {/* Content */}
        <div className="mt-12 space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold">We're not hiring today</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              But we're always interested in meeting thoughtful people who are passionate about
              building products that help people celebrate life's meaningful moments.
            </p>
          </div>

          {/* What We Value */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">What We Value</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Thoughtful craft</h3>
                <p className="text-base text-muted-foreground">
                  We care deeply about the details that make products feel warm and human.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Genuine empathy</h3>
                <p className="text-base text-muted-foreground">
                  We build for real people experiencing real emotions during real celebrations.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Elegant simplicity</h3>
                <p className="text-base text-muted-foreground">
                  The best solutions are often the simplest ones.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Meaningful impact</h3>
                <p className="text-base text-muted-foreground">
                  We measure success by the celebrations we help create, not the features we ship.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold">Interested in MemoryPop?</h2>
            <p className="text-base text-muted-foreground">
              We'd love to hear from you.
            </p>
            <p className="text-base">
              Send us a note at{' '}
              <a
                href="mailto:hello@memorypop.com"
                className="font-medium text-primary hover:underline"
              >
                hello@memorypop.com
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              Tell us what you're working on and why you're interested in what we're building.
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Learn more <Link href="/about" className="underline hover:text-foreground">about MemoryPop</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
