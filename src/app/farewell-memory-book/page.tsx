/**
 * Farewell Memory Book Landing Page
 *
 * Emotional, product-focused landing page for farewell memory books.
 * Part of Phase 2C: Landing Pages (Revised)
 */

'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EventSchema } from '@/components/EventSchema';
import { trackLandingPageViewed } from '@/lib/analytics-ga4';

export default function FarewellMemoryBookPage() {
  useEffect(() => {
    // Track landing page view (GA4)
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source') || 'organic';
    trackLandingPageViewed('farewell', source);
  }, []);

  return (
    <>
      <EventSchema occasion="Farewell" occasionSlug="farewell-memory-book" />

      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl">
          {/* Hero Section */}
          <div className="px-6 py-16 text-center sm:py-24">
            <h1 className="text-5xl font-bold leading-tight sm:text-6xl md:text-7xl">
              Goodbyes are hard. Make them meaningful.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
              Give them something they can hold onto: memories, photos, and messages from everyone who'll miss them.
            </p>
            <div className="mt-10">
              <Link
                href="/create?occasion=farewell"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 text-xl font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
              >
                Create Your Farewell MemoryPop →
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">Takes less than 2 minutes. Free to start.</p>
            </div>
          </div>

          {/* The Problem */}
          <div className="bg-muted/30 px-6 py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                They're leaving. And you want them to know.
              </h2>
              <p className="mt-6 text-lg leading-relaxed">
                You want to tell them what they meant. How they changed things. That they'll be missed.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                But a card gets left behind. A Slack thread gets buried. And the moment passes without really saying what matters.
              </p>
            </div>
          </div>

          {/* The Emotional Outcome */}
          <div className="px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                One last gift before they go
              </h2>
              <div className="mt-10 space-y-6 text-lg leading-relaxed">
                <p>
                  It's their last day. The going-away party. You pull them aside and say, "We made something for you."
                </p>
                <p>
                  They open it. There's a message from a coworker they didn't think noticed them. A photo from their best friend with a story they'd forgotten. A note from someone saying, "You made this place better."
                </p>
                <p className="font-semibold">
                  They realize: they mattered here.
                </p>
                <p>
                  This isn't just a farewell gift. It's proof that the time they spent here meant something. That the people they leave behind will remember. And when they're lonely in a new city or doubting their decision, they'll come back to this and remember they were loved.
                </p>
              </div>
            </div>
          </div>

          {/* What a MemoryPop Looks Like */}
          <div className="bg-muted/30 px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                See what they'll carry with them
              </h2>
              <p className="mt-4 text-center text-lg text-muted-foreground">
                Every goodbye, every memory, every "we'll miss you"—saved forever
              </p>

              {/* Product Screenshots */}
              <div className="mt-14 space-y-10">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
                  <Image
                    src="/images/mockups/farewell-cover.png"
                    alt="Farewell MemoryPop showing goodbye messages, contributor count, and shared memories"
                    width={1600}
                    height={1000}
                    className="w-full h-auto"
                    priority
                  />
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
                    <Image
                      src="/images/mockups/farewell-message.png"
                      alt="Farewell message card showing heartfelt goodbye from colleague"
                      width={800}
                      height={1000}
                      className="w-full h-auto"
                    />
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
                    <Image
                      src="/images/mockups/farewell-memory-collection.png"
                      alt="Collection of shared moments and memories from friends and colleagues"
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
                  Experience a farewell MemoryPop
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Feel what it's like to know you'll be missed
                </p>

                {/* Interactive Demo Preview */}
                <div className="mt-10">
                  <div className="mx-auto aspect-video max-w-3xl overflow-hidden rounded-xl border-2 border-border bg-card shadow-2xl">
                    <Image
                      src="/images/mockups/farewell-demo-preview.png"
                      alt="Interactive preview of farewell MemoryPop in browser showing messages and photos"
                      width={1920}
                      height={1080}
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/create?occasion=farewell"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    Create Your Farewell MemoryPop →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-muted/30 px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                Two minutes to say what matters
              </h2>

              <div className="mt-16 space-y-12">
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You start with your goodbye</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Write what you want them to know. Two minutes. You've just created something they'll carry into their next chapter.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You bring everyone together one last time</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Share the link with everyone who'll miss them. Friends, coworkers, neighbors—people from every part of their life. Watch them show up to say goodbye.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You watch it become something real</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Every message that comes in is proof: they mattered to more people than they knew. When it feels complete, you're ready.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You give them something to hold onto</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      At the going-away party, or the night before they leave, or their first week in a new place. Whenever feels right. They'll have it forever.
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
                What people wrote before goodbye
              </h2>
              <p className="mt-4 text-center text-lg text-muted-foreground">
                Real messages from real farewells
              </p>

              <div className="mt-12 space-y-8">
                <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-lg italic leading-relaxed">
                    "Working with you for the past 3 years has been a gift. Your optimism, your creativity, your willingness to always help—you made this place better. Good luck in San Francisco!"
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div>
                      <p className="font-semibold">Maria T.</p>
                      <p className="text-sm text-muted-foreground">When a coworker moved cities for a new job</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-lg italic leading-relaxed">
                    "From borrowing sugar to late-night talks on the porch, you've been more than a neighbor—you've been family. We'll miss you, but we're so excited for your next adventure."
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div>
                      <p className="font-semibold">The Johnson Family</p>
                      <p className="text-sm text-muted-foreground">When neighbors moved away</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-lg italic leading-relaxed">
                    "From spontaneous road trips to that disastrous camping trip (remember the rain?!), you've made every moment memorable. Can't wait to visit you in your new city!"
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div>
                      <p className="font-semibold">Alex R.</p>
                      <p className="text-sm text-muted-foreground">When a best friend moved across the country</p>
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
                  <h3 className="text-xl font-semibold">Can I keep it secret until they're leaving?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    Yes. It stays private until the moment you choose to share it. The surprise makes it even more meaningful.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">What if people are spread out across different cities?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    That's exactly when this works best. Everyone contributes from wherever they are. Long-distance goodbyes become real connections.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Can we include photos from our time together?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    Absolutely. Both you and contributors can add photos from shared memories. Those images tell the story.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">When should I give it to them?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    Whenever feels right. At their going-away party. The day before they leave. Their first week somewhere new. Trust your instinct.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="px-6 py-20 text-center sm:py-28">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-4xl font-bold sm:text-5xl">
                Ready to give them a goodbye they'll never forget?
              </h2>
              <p className="mt-6 text-xl text-muted-foreground">
                Start your farewell MemoryPop now. Takes 2 minutes. Free to start.
              </p>
              <div className="mt-10">
                <Link
                  href="/create?occasion=farewell"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 text-xl font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
                >
                  Create Your Farewell MemoryPop →
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
