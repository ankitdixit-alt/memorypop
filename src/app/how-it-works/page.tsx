import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How MemoryPop Works',
  description: 'Learn how MemoryPop helps you collect memories from loved ones and create a beautiful keepsake book in 5 simple steps.',
  openGraph: {
    title: 'How MemoryPop Works',
    description: 'Learn how MemoryPop helps you collect memories from loved ones and create a beautiful keepsake book in 5 simple steps.',
    url: '/how-it-works',
  },
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">How MemoryPop Works</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create a beautiful celebration in 5 simple steps
          </p>
        </div>

        {/* Content */}
        <div className="mt-12 space-y-12">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="text-5xl">✨</div>
            <h2 className="text-2xl font-semibold">1. Create Your MemoryPop</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Choose the occasion you're celebrating, add a personal message to your recipient,
              and give your MemoryPop a name. The whole process takes less than 2 minutes.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="text-5xl">📨</div>
            <h2 className="text-2xl font-semibold">2. Invite Contributors</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Share a unique link with friends, family, colleagues, or anyone you want to include.
              Anyone with the link can contribute—no signup required.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="text-5xl">💝</div>
            <h2 className="text-2xl font-semibold">3. Contributors Add Memories</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Contributors write personal messages, upload photos, choose emojis that capture
              the mood, and add their memories. Each contribution becomes part of something beautiful.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3">
            <div className="text-5xl">🎁</div>
            <h2 className="text-2xl font-semibold">4. You Collect and Curate</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Access your creator dashboard anytime to review submissions and see who's contributed.
              You control when the MemoryPop is ready to reveal.
            </p>
          </div>

          {/* Step 5 */}
          <div className="space-y-3">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-semibold">5. Reveal and Treasure Forever</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Share the completed MemoryPop with your recipient. They'll experience all the memories
              in one beautiful place. Keep it as a digital keepsake forever.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold">Ready to create your first MemoryPop?</h3>
          <Link
            href="/create"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create Your MemoryPop
          </Link>
          <div className="mt-8 space-y-2 text-sm text-muted-foreground">
            <p>
              Have questions? Visit our <Link href="/help-center" className="underline hover:text-foreground">Help Center</Link>
            </p>
            <p>
              Explore celebrations we support: <Link href="/occasions" className="underline hover:text-foreground">Occasions</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
