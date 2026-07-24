import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About MemoryPop',
  description: 'MemoryPop helps people celebrate life\'s meaningful moments together by collecting memories in one beautiful place.',
  openGraph: {
    title: 'About MemoryPop',
    description: 'MemoryPop helps people celebrate life\'s meaningful moments together by collecting memories in one beautiful place.',
    url: '/about',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">About MemoryPop</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Celebrating life's meaningful moments, together
          </p>
        </div>

        {/* Content */}
        <div className="mt-12 space-y-12">
          {/* Mission */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              We help people celebrate life's meaningful moments together by collecting memories in one beautiful place.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Every celebration deserves more than a store-bought card. It deserves a collection of genuine memories,
              heartfelt messages, and moments captured by the people who matter most.
            </p>
          </div>

          {/* Why We Exist */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Why MemoryPop Exists</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Celebrations bring people together—but the memories often get scattered across texts, emails,
              and social media, then lost.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              We built MemoryPop to change that.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              MemoryPop is a place where everyone who cares can contribute to something meaningful. A birthday.
              A farewell. A wedding. A thank you. Whatever the occasion, MemoryPop helps you collect the memories
              that matter and keep them in one beautiful place, forever.
            </p>
          </div>

          {/* What We Believe */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">What We Believe</h2>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Every celebration deserves one beautiful home</h3>
              <p className="text-base text-muted-foreground">
                Not scattered across 20 different platforms, but collected in one thoughtful place.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Memories are made together</h3>
              <p className="text-base text-muted-foreground">
                The best celebrations aren't created alone. They're built by everyone who cares.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Emotion before technology</h3>
              <p className="text-base text-muted-foreground">
                We build tools that feel warm and human, not cold and complicated.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Simplicity is a feature</h3>
              <p className="text-base text-muted-foreground">
                Creating something meaningful shouldn't require a manual.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold">Start celebrating together</h3>
          <Link
            href="/create"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create Your First MemoryPop
          </Link>
          <div className="mt-8 space-y-2 text-sm text-muted-foreground">
            <p>
              Questions? <Link href="/contact" className="underline hover:text-foreground">Get in touch</Link>
            </p>
            <p>
              Interested in joining us? <Link href="/careers" className="underline hover:text-foreground">Careers</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
