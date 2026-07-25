/**
 * Birthday Memory Book Landing Page
 *
 * Emotional, product-focused landing page for birthday memory books.
 * Part of Phase 2C: Landing Pages (Revised)
 */

'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EventSchema } from '@/components/EventSchema';
import { trackLandingPageViewed } from '@/lib/analytics-ga4';

export default function BirthdayMemoryBookPage() {
  useEffect(() => {
    // Track landing page view (GA4)
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source') || 'organic';
    trackLandingPageViewed('birthday', source);
  }, []);

  return (
    <>
      <EventSchema occasion="Birthday" occasionSlug="birthday-memory-book" />

      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl">
          {/* Hero Section */}
          <div className="px-6 py-16 text-center sm:py-24">
            <h1 className="text-5xl font-bold leading-tight sm:text-6xl md:text-7xl">
              Imagine their face when they see it
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
              Everyone they love sharing memories, photos, and birthday wishes—all in one place they can keep forever.
            </p>
            <div className="mt-10">
              <Link
                href="/create?occasion=birthday"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 text-xl font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
              >
                Create Your Birthday MemoryPop →
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">Takes less than 2 minutes. Free to start.</p>
            </div>
          </div>

          {/* The Problem */}
          <div className="bg-muted/30 px-6 py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Birthdays deserve more than a card
              </h2>
              <p className="mt-6 text-lg leading-relaxed">
                You want to give something meaningful. Something that shows how much they're loved.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                But coordinating a group card is a hassle. Text threads get lost. Cards get thrown away. And nothing really captures the moment.
              </p>
            </div>
          </div>

          {/* The Emotional Outcome */}
          <div className="px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                Picture this moment
              </h2>
              <div className="mt-10 space-y-6 text-lg leading-relaxed">
                <p>
                  It's their birthday morning. They open your gift—a link to their MemoryPop.
                </p>
                <p>
                  They start scrolling. There's a message from their best friend from college they haven't seen in years. A photo from their sister with a memory they'd completely forgotten. A heartfelt note from a coworker who never usually opens up.
                </p>
                <p className="font-semibold">
                  They're smiling. Then laughing. Then maybe crying a little.
                </p>
                <p>
                  This isn't just a birthday gift. It's proof of a life well-lived. And they'll come back to it again and again.
                </p>
              </div>
            </div>
          </div>

          {/* What a MemoryPop Looks Like */}
          <div className="bg-muted/30 px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                See what they'll see
              </h2>
              <p className="mt-4 text-center text-lg text-muted-foreground">
                Every memory, every photo, every message—all in one place they can return to forever
              </p>

              {/* Product Screenshots */}
              <div className="mt-14 space-y-10">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
                  <Image
                    src="/images/mockups/birthday-cover.png"
                    alt="Birthday MemoryPop showing recipient name, contributor count, and celebration stats"
                    width={1600}
                    height={1000}
                    className="w-full h-auto"
                    priority
                  />
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
                    <Image
                      src="/images/mockups/birthday-message.png"
                      alt="Birthday message card showing heartfelt memory from friend"
                      width={800}
                      height={1000}
                      className="w-full h-auto"
                    />
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
                    <Image
                      src="/images/mockups/birthday-photo-grid.png"
                      alt="Photo grid showing celebration moments shared by friends and family"
                      width={800}
                      height={1000}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Experience a MemoryPop (Interactive Demo Placeholder) */}
          <div className="px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-4xl">
              <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-12 text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Experience a MemoryPop
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  See what it feels like to receive birthday wishes from everyone you love
                </p>

                {/* Interactive Demo Preview */}
                <div className="mt-10">
                  <div className="mx-auto aspect-video max-w-3xl overflow-hidden rounded-xl border-2 border-border bg-card shadow-2xl">
                    <Image
                      src="/images/mockups/birthday-demo-preview.png"
                      alt="Interactive preview of birthday MemoryPop in browser showing messages and photos"
                      width={1920}
                      height={1080}
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/create?occasion=birthday"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    Create Your Own Birthday MemoryPop →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-muted/30 px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                You're two minutes away from something unforgettable
              </h2>

              <div className="mt-16 space-y-12">
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You decide to do something special</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Write the first message. It takes two minutes. You've just started something that will mean everything.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You bring everyone together</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Share the link with the people who love them. Watch as old friends, family, and coworkers all show up to celebrate.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You watch it come to life</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Each new message is a reminder: you're not the only one who thinks they're special. When it feels right, you're ready.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You see their face when they open it</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      That moment when they realize what you made for them. That's what you're here for.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real Examples */}
          <div className="px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                What people wrote when it mattered
              </h2>
              <p className="mt-4 text-center text-lg text-muted-foreground">
                Real messages that made birthdays unforgettable
              </p>

              <div className="mt-12 space-y-8">
                <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-lg italic leading-relaxed">
                    "Remember that time you tried to teach me to drive and we ended up in the grocery store parking lot for 3 hours? You were so patient. Thanks for always believing in me, even when I didn't believe in myself. Love you, Dad."
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div>
                      <p className="font-semibold">Sarah M.</p>
                      <p className="text-sm text-muted-foreground">For her dad's 50th birthday</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-lg italic leading-relaxed">
                    "From college roommates to wedding parties to raising kids in the same neighborhood—you've been there for every chapter. Can't wait to see what adventures the next 30 years bring. Happy birthday, bestie!"
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div>
                      <p className="font-semibold">Emma K.</p>
                      <p className="text-sm text-muted-foreground">For her best friend's 30th birthday</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-lg italic leading-relaxed">
                    "You bring so much energy and laughter to our team. Thanks for always being the first to celebrate everyone's wins and the last to leave after a long project. Have the most amazing birthday—you deserve it!"
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div>
                      <p className="font-semibold">Marketing Team</p>
                      <p className="text-sm text-muted-foreground">For a coworker's birthday surprise</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-muted/30 px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                Common questions
              </h2>

              <div className="mt-12 space-y-8">
                <div>
                  <h3 className="text-xl font-semibold">Does this cost anything?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    No. Start for free. Collect unlimited messages and photos. Only upgrade if you want extras like videos or premium themes.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Can I keep it secret until their birthday?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    Yes. It stays completely private until the moment you're ready. That's what makes the surprise so good.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">What if people don't know what to write?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    They will. Once someone starts thinking about a memory, the words come naturally. We include prompts if they need them, but most people don't.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">How do I give it to them?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    You'll get a link. Send it before their birthday, or wait and share it in person at the party. The moment you choose will be perfect.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Can I add my own message?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    Of course. Your message matters just as much as everyone else's.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="px-6 py-20 text-center sm:py-28">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-4xl font-bold sm:text-5xl">
                Ready to create something they'll never forget?
              </h2>
              <p className="mt-6 text-xl text-muted-foreground">
                Start your birthday MemoryPop now. Takes 2 minutes. Free to start.
              </p>
              <div className="mt-10">
                <Link
                  href="/create?occasion=birthday"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 text-xl font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
                >
                  Create Your Birthday MemoryPop →
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                <Link href="/occasions" className="transition-colors hover:text-foreground">
                  See all occasions
                </Link>
                <Link href="/pricing" className="transition-colors hover:text-foreground">
                  View pricing
                </Link>
                <Link href="/how-it-works" className="transition-colors hover:text-foreground">
                  How it works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
