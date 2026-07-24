import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Occasions',
  description: 'Celebrate every meaningful moment with MemoryPop. Birthdays, weddings, farewells, retirements, and more—collect memories together.',
  openGraph: {
    title: 'Occasions | MemoryPop',
    description: 'Celebrate every meaningful moment with MemoryPop. Birthdays, weddings, farewells, retirements, and more—collect memories together.',
    url: '/occasions',
  },
};

export default function OccasionsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Occasions</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Every celebration deserves one beautiful home
          </p>
        </div>

        {/* Intro */}
        <div className="mt-12 text-center">
          <p className="text-base leading-relaxed text-muted-foreground">
            MemoryPop helps you celebrate life's meaningful moments by collecting memories
            from the people who matter most.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Whether you're celebrating a birthday, marking a milestone, saying goodbye, or
            just saying thank you—MemoryPop brings everyone together in one beautiful place.
          </p>
        </div>

        {/* Occasions List */}
        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-semibold text-center">Celebrations We Support</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Birthdays</h3>
              <p className="text-sm text-muted-foreground">
                Collect birthday wishes, funny stories, and favorite memories from friends and family.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Farewells</h3>
              <p className="text-sm text-muted-foreground">
                Create a thoughtful send-off for colleagues, friends, or loved ones moving on to new adventures.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Retirements</h3>
              <p className="text-sm text-muted-foreground">
                Celebrate a career well-lived with memories, thank-yous, and messages from coworkers.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Weddings</h3>
              <p className="text-sm text-muted-foreground">
                Gather well-wishes and advice for the happy couple from friends and family.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Anniversaries</h3>
              <p className="text-sm text-muted-foreground">
                Mark special milestones with memories and messages celebrating your journey together.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">New Arrivals</h3>
              <p className="text-sm text-muted-foreground">
                Welcome a new baby with messages of love, hope, and wisdom from family and friends.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Thank You</h3>
              <p className="text-sm text-muted-foreground">
                Show appreciation for teachers, mentors, coaches, or anyone who's made a difference.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Graduations</h3>
              <p className="text-sm text-muted-foreground">
                Celebrate achievements with messages of congratulations and encouragement for the future.
              </p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <p className="text-base font-medium text-muted-foreground">And more...</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Whatever the occasion, MemoryPop helps you celebrate together.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 rounded-lg bg-card border border-border/60 p-8">
          <h2 className="text-xl font-semibold text-center">How It Works</h2>
          <ol className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li>1. Choose your occasion</li>
            <li>2. Invite contributors</li>
            <li>3. Collect memories</li>
            <li>4. Reveal and treasure forever</li>
          </ol>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/create"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create Your MemoryPop
          </Link>
          <p className="mt-6 text-sm text-muted-foreground">
            Want to see the process? <Link href="/how-it-works" className="underline hover:text-foreground">How it works</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
