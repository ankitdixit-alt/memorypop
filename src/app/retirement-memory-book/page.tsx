/**
 * Retirement Memory Book Landing Page
 *
 * Emotional, product-focused landing page for retirement memory books.
 * Part of Phase 2C: Landing Pages (Revised)
 */

'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EventSchema } from '@/components/EventSchema';
import { trackLandingPageViewed } from '@/lib/analytics-ga4';

export default function RetirementMemoryBookPage() {
  useEffect(() => {
    // Track landing page view (GA4)
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source') || 'organic';
    trackLandingPageViewed('retirement', source);
  }, []);

  return (
    <>
      <EventSchema occasion="Retirement" occasionSlug="retirement-memory-book" />

      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl">
          {/* Hero Section */}
          <div className="px-6 py-16 text-center sm:py-24">
            <h1 className="text-5xl font-bold leading-tight sm:text-6xl md:text-7xl">
              Honor a career. Celebrate a legacy.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
              Give them a retirement gift they'll treasure: messages, memories, and gratitude from everyone who worked alongside them.
            </p>
            <div className="mt-10">
              <Link
                href="/create?occasion=retirement"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 text-xl font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
              >
                Create Your Retirement MemoryPop →
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">Takes less than 2 minutes. Free to start.</p>
            </div>
          </div>

          {/* The Problem */}
          <div className="bg-muted/30 px-6 py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                A retirement party card isn't enough
              </h2>
              <p className="mt-6 text-lg leading-relaxed">
                Thirty years of collaboration. Countless late nights. Projects that changed everything.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                They deserve more than signatures on a card that gets passed around the conference room.
              </p>
            </div>
          </div>

          {/* The Emotional Outcome */}
          <div className="px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                Their last day. Your gift.
              </h2>
              <div className="mt-10 space-y-6 text-lg leading-relaxed">
                <p>
                  The retirement party is winding down. You pull them aside and share the link.
                </p>
                <p>
                  They start reading. There's a message from their first intern—now a director at another company. A story from a colleague in the Tokyo office they mentored 15 years ago. A note from the CEO thanking them for their impact.
                </p>
                <p className="font-semibold">
                  They didn't realize how many lives they'd touched.
                </p>
                <p>
                  This isn't just a retirement gift. It's a record of what they built. Who they mentored. The difference they made. And they'll return to it every time they wonder if their career mattered.
                </p>
              </div>
            </div>
          </div>

          {/* What a MemoryPop Looks Like */}
          <div className="bg-muted/30 px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                See what they'll receive
              </h2>
              <p className="mt-4 text-center text-lg text-muted-foreground">
                A career's worth of impact, gratitude, and memories—preserved forever
              </p>

              {/* Product Screenshots */}
              <div className="mt-14 space-y-10">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
                  <Image
                    src="/images/mockups/retirement-cover.png"
                    alt="Retirement MemoryPop showing career milestones, contributor count, and legacy"
                    width={1600}
                    height={1000}
                    className="w-full h-auto"
                    priority
                  />
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
                    <Image
                      src="/images/mockups/retirement-message.png"
                      alt="Retirement message card showing heartfelt gratitude from colleague"
                      width={800}
                      height={1000}
                      className="w-full h-auto"
                    />
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
                    <Image
                      src="/images/mockups/retirement-timeline.png"
                      alt="Career timeline showing 30 years of professional milestones and achievements"
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
                  Experience a retirement MemoryPop
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  See how colleagues honor a career well-lived
                </p>

                {/* Interactive Demo Preview */}
                <div className="mt-10">
                  <div className="mx-auto aspect-video max-w-3xl overflow-hidden rounded-xl border-2 border-border bg-card shadow-2xl">
                    <Image
                      src="/images/mockups/retirement-demo-preview.png"
                      alt="Interactive preview of retirement MemoryPop in browser showing messages and memories"
                      width={1920}
                      height={1080}
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/create?occasion=retirement"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    Create Your Retirement MemoryPop →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-muted/30 px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                Two minutes to honor a lifetime of work
              </h2>

              <div className="mt-16 space-y-12">
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You decide they deserve more than a card</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Write your message first. Two minutes. You've just started creating something they'll treasure forever.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You gather voices from their career</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Send the link to their team, mentees, old colleagues—people from every chapter. Watch them show up to say thank you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You see their impact through others' eyes</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Every message that comes in tells a story. You're creating a record of what they built. When it feels right, it's ready.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You watch them realize their legacy</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Present it at the party, or share it privately. That moment when they see what you've created—that's why you're doing this.
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
                What colleagues wrote at the end
              </h2>
              <p className="mt-4 text-center text-lg text-muted-foreground">
                Real messages from real retirements
              </p>

              <div className="mt-12 space-y-8">
                <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-lg italic leading-relaxed">
                    "You taught me everything I know about leading with integrity and empathy. Your door was always open, your advice always thoughtful. Enjoy every moment of retirement—you've earned it!"
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div>
                      <p className="font-semibold">David L.</p>
                      <p className="text-sm text-muted-foreground">Direct report for 8 years</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-lg italic leading-relaxed">
                    "From late nights before big launches to celebrating wins as a team, you made work feel less like work. Thanks for your patience, your humor, and your dedication. Happy retirement!"
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div>
                      <p className="font-semibold">Jennifer S.</p>
                      <p className="text-sm text-muted-foreground">Project partner</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-lg italic leading-relaxed">
                    "Your energy, your stories, and your kindness made every day brighter. We'll miss you, but we're so excited for this next chapter. Go enjoy that cabin in the mountains!"
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div>
                      <p className="font-semibold">The Sales Team</p>
                      <p className="text-sm text-muted-foreground">Colleagues for 15 years</p>
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
                  <h3 className="text-xl font-semibold">Can the whole company contribute?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    Yes. Share the link with HR, team leads, or anyone who worked with them. Everyone can add messages. You decide when it's complete.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">What if our team is remote or spread across offices?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    Perfect for that. People contribute from wherever they are. Former colleagues in other cities can participate too.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">How do we present it at the retirement party?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    You'll get a link. Project it on a screen, pass around a tablet, or send it to them ahead of time. The moment will feel right however you choose.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Can they keep it after retirement?</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    Forever. They'll have the link. They can revisit it whenever they want to remember what they built.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="px-6 py-20 text-center sm:py-28">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-4xl font-bold sm:text-5xl">
                Ready to honor their legacy?
              </h2>
              <p className="mt-6 text-xl text-muted-foreground">
                Start your retirement MemoryPop now. Takes 2 minutes. Free to start.
              </p>
              <div className="mt-10">
                <Link
                  href="/create?occasion=retirement"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 text-xl font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
                >
                  Create Your Retirement MemoryPop →
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
