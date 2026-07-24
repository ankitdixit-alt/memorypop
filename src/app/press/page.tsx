import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press',
  description: 'MemoryPop press information: Brand overview, company details, and press contact.',
  openGraph: {
    title: 'Press | MemoryPop',
    description: 'MemoryPop press information: Brand overview, company details, and press contact.',
    url: '/press',
  },
};

export default function PressPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Press</h1>
        </div>

        {/* Content */}
        <div className="mt-12 space-y-12">
          {/* About */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">About MemoryPop</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              MemoryPop helps people celebrate life's meaningful moments together by collecting memories
              from friends, family, and loved ones in one beautiful place.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Whether it's a birthday, farewell, wedding, retirement, or any special occasion—MemoryPop
              brings everyone together to create something meaningful that lasts forever.
            </p>
          </div>

          {/* Company Overview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Company Overview</h2>
            <div className="space-y-2 text-base text-muted-foreground">
              <p><strong className="text-foreground">Founded:</strong> 2026</p>
              <p><strong className="text-foreground">Mission:</strong> Help people celebrate life's meaningful moments together</p>
              <p><strong className="text-foreground">Product:</strong> Digital memory book platform for collaborative celebrations</p>
              <p>
                <strong className="text-foreground">Website:</strong>{' '}
                <a href="https://memorypop.app" className="text-primary hover:underline">memorypop.app</a>
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How It Works</h2>
            <ol className="space-y-2 text-base text-muted-foreground list-decimal list-inside">
              <li><strong className="text-foreground">Create:</strong> Choose an occasion and add a personal message</li>
              <li><strong className="text-foreground">Invite:</strong> Share a link with contributors (no signup required)</li>
              <li><strong className="text-foreground">Collect:</strong> Contributors add memories, photos, and messages</li>
              <li><strong className="text-foreground">Reveal:</strong> Share the completed MemoryPop with the recipient</li>
              <li><strong className="text-foreground">Treasure:</strong> Keep it as a digital keepsake forever</li>
            </ol>
          </div>

          {/* Brand Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Brand Description</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              MemoryPop is a digital celebration platform that helps people collect memories from the people
              who matter most. It's designed for birthdays, farewells, weddings, retirements, and any meaningful
              moment worth celebrating together.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Unlike traditional greeting cards or scattered social media posts, MemoryPop creates one beautiful
              home for all the memories, messages, and moments that make a celebration special.
            </p>
          </div>

          {/* Press Contact */}
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold">Press Contact</h2>
            <p className="text-base text-muted-foreground">
              For press inquiries, interviews, or partnership opportunities:
            </p>
            <p className="text-lg">
              <strong>Email:</strong>{' '}
              <a
                href="mailto:partnerships@memorypop.com"
                className="font-medium text-primary hover:underline"
              >
                partnerships@memorypop.com
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              We typically respond within 24-48 hours.
            </p>
          </div>

          {/* Press Resources */}
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold">Press Resources</h2>
            <p className="text-base text-muted-foreground">
              Brand assets, logos, and screenshots coming soon.
            </p>
            <p className="text-sm text-muted-foreground">
              For immediate needs, please contact{' '}
              <a
                href="mailto:partnerships@memorypop.com"
                className="underline hover:text-foreground"
              >
                partnerships@memorypop.com
              </a>
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
