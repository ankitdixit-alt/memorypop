import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'MemoryPop pricing: Standard (free), Premium (enhanced features), and Keepsake (physical memory book). Celebrate together, your way.',
  openGraph: {
    title: 'Pricing | MemoryPop',
    description: 'MemoryPop pricing: Standard (free), Premium (enhanced features), and Keepsake (physical memory book). Celebrate together, your way.',
    url: '/pricing',
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Simple, transparent pricing for every celebration
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {/* Standard */}
          <div className="rounded-lg bg-card border border-border/60 p-8 space-y-4">
            <h2 className="text-2xl font-semibold">Standard</h2>
            <div className="text-3xl font-bold">Free forever</div>
            <p className="text-sm text-muted-foreground">Perfect for most celebrations.</p>

            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium">Includes:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Unlimited contributors</li>
                <li>✓ Text, photos, and emojis</li>
                <li>✓ Creator dashboard</li>
                <li>✓ Digital MemoryPop forever</li>
                <li>✓ Share link anytime</li>
              </ul>
            </div>

            <div className="pt-4">
              <Link
                href="/create"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create for Free
              </Link>
            </div>
          </div>

          {/* Premium */}
          <div className="rounded-lg bg-card border border-border/60 p-8 space-y-4">
            <h2 className="text-2xl font-semibold">Premium</h2>
            <div className="text-3xl font-bold">Coming soon</div>
            <p className="text-sm text-muted-foreground">Enhanced features for special celebrations.</p>

            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium">Everything in Standard, plus:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Premium themes and styles</li>
                <li>✓ Video messages</li>
                <li>✓ Advanced customization</li>
                <li>✓ Priority support</li>
              </ul>
            </div>

            <div className="pt-4">
              <div className="text-sm text-muted-foreground">Pricing to be announced.</div>
            </div>
          </div>

          {/* Keepsake */}
          <div className="rounded-lg bg-card border border-border/60 p-8 space-y-4">
            <h2 className="text-2xl font-semibold">Keepsake</h2>
            <div className="text-3xl font-bold">Coming soon</div>
            <p className="text-sm text-muted-foreground">Turn your digital MemoryPop into a beautiful physical book.</p>

            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium">Everything in Premium, plus:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Professional printed memory book</li>
                <li>✓ Premium paper and binding</li>
                <li>✓ Delivered to your door</li>
                <li>✓ Keep the digital version forever</li>
              </ul>
            </div>

            <div className="pt-4">
              <div className="text-sm text-muted-foreground">Pricing to be announced.</div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold">Questions about pricing?</h3>
          <div className="mt-4 space-x-4 text-sm text-muted-foreground">
            <Link href="/contact" className="underline hover:text-foreground">Contact us</Link>
            <span>or visit our</span>
            <Link href="/help-center" className="underline hover:text-foreground">Help Center</Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-base text-muted-foreground mb-4">Ready to start?</p>
          <Link
            href="/create"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create Your MemoryPop
          </Link>
        </div>
      </div>
    </main>
  );
}
