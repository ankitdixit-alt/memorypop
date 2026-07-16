"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { trackEvent } from "@/lib/analytics"

/* -------------------------------------------------------------------------- */
/*  Inline icons (no external icon library)                                   */
/* -------------------------------------------------------------------------- */

type IconProps = { className?: string }

function Star({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.9l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.94L12 2.5z" />
    </svg>
  )
}

function ArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

function Play({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5z" />
    </svg>
  )
}

function Heart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 21s-7.5-4.6-10-9.3C.6 8.3 2 4.9 5.3 4.3 7.3 4 9 5 12 8c3-3 4.7-4 6.7-3.7C22 4.9 23.4 8.3 22 11.7 19.5 16.4 12 21 12 21z" />
    </svg>
  )
}

function Sparkles({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2z" />
      <path d="M19 13l.8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13z" />
    </svg>
  )
}

function PlusCircle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function Users({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 19v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function Gift({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
      <path d="M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5zM12 8s1.5-5 4-5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  )
}

function Wand({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M15 4V2M15 10V8M9 4h2M19 4h2M17 6l1.5-1.5M13 6 11.5 4.5" />
      <path d="M3 21l12-12 2 2L5 23z" />
    </svg>
  )
}

function ImageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.5-3.5L9 20" />
    </svg>
  )
}

function Clock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function ShieldCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function InfinityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6.5 8.5c-2.5 0-4 1.6-4 3.5s1.5 3.5 4 3.5c3.5 0 4-7 8-7 2.5 0 4 1.6 4 3.5s-1.5 3.5-4 3.5c-3.5 0-4-7-8-7z" />
    </svg>
  )
}

function Menu({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function X({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Buttons (styled links to /create)                                         */
/* -------------------------------------------------------------------------- */

function PrimaryButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href="/create"
      className={`inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 ${className}`}
    >
      {children}
    </Link>
  )
}

function OutlineButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href="/create"
      className={`inline-flex h-13 items-center justify-center gap-2 rounded-full border border-border bg-card px-7 text-base font-medium text-foreground transition-colors hover:bg-secondary ${className}`}
    >
      {children}
    </Link>
  )
}

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Occasions", href: "#occasions" },
  { label: "Why MemoryPop", href: "#why" },
]

const contributors = [
  { src: "/images/avatar-1.png", name: "Maya" },
  { src: "/images/avatar-2.png", name: "Daniel" },
  { src: "/images/avatar-3.png", name: "Priya" },
  { src: "/images/avatar-4.png", name: "Robert" },
]

const messages = [
  {
    src: "/images/avatar-2.png",
    name: "Daniel",
    time: "2h ago",
    text: "Happy birthday, Emma! Remember our road trip in \u201919? Best week ever.",
    photo: "/images/memory-friends.png",
  },
  {
    src: "/images/avatar-3.png",
    name: "Priya",
    time: "5h ago",
    text: "You make every room brighter. So grateful for you. Here\u2019s to 30!",
    photo: null,
  },
]

const occasions = [
  {
    title: "Birthdays",
    copy: "Milestone or just because\u2014make their day unforgettable.",
    src: "/images/birthday-cover.png",
    span: "sm:col-span-2 sm:row-span-2",
  },
  {
    title: "Weddings",
    copy: "Collect toasts and well-wishes from every guest.",
    src: "/images/celebration-wedding.png",
    span: "",
  },
  {
    title: "New babies",
    copy: "Welcome them with love from the whole family.",
    src: "/images/celebration-baby.png",
    span: "",
  },
  {
    title: "Graduations",
    copy: "Cheer on their next big chapter, together.",
    src: "/images/celebration-graduation.png",
    span: "",
  },
  {
    title: "Retirements",
    copy: "Honor a lifetime of memories and gratitude.",
    src: "/images/celebration-retirement.png",
    span: "",
  },
]

const steps = [
  {
    Icon: PlusCircle,
    step: "01",
    title: "Start a MemoryPop",
    copy: "Pick the occasion, add a cover photo, and set the reveal date in under a minute.",
  },
  {
    Icon: Users,
    step: "02",
    title: "Invite everyone",
    copy: "Share one link. Friends and family add photos and messages from any device.",
  },
  {
    Icon: Gift,
    step: "03",
    title: "Reveal the magic",
    copy: "Our AI weaves it all into a beautiful, shareable celebration to unwrap together.",
  },
]

const features = [
  {
    Icon: Wand,
    title: "AI that adds the heart",
    copy: "Smart prompts help everyone write their best message, then AI stitches it into a story.",
  },
  {
    Icon: Users,
    title: "Beautifully collaborative",
    copy: "Everyone contributes to one shared page\u2014no chasing texts across five group chats.",
  },
  {
    Icon: ImageIcon,
    title: "Photos, front and center",
    copy: "Gorgeous layouts make every snapshot and memory look like it belongs in a gallery.",
  },
  {
    Icon: Clock,
    title: "Ready in minutes",
    copy: "No design skills needed. Start, invite, and reveal\u2014all from your phone.",
  },
  {
    Icon: ShieldCheck,
    title: "Private by default",
    copy: "Your celebration is only seen by the people you invite. Always.",
  },
  {
    Icon: InfinityIcon,
    title: "Yours forever",
    copy: "Keep every message and photo in a keepsake you can revisit for years.",
  },
]

const testimonials = [
  {
    quote:
      "I made a MemoryPop for my mum\u2019s 60th and she cried happy tears. Seeing messages from people across three continents in one place was pure magic.",
    name: "Maya Chen",
    role: "Daughter & organizer",
    src: "/images/avatar-1.png",
  },
  {
    quote:
      "Way better than a group chat. The AI recap turned 50 messages into something that felt like a beautiful little film.",
    name: "Daniel Okafor",
    role: "Best man",
    src: "/images/avatar-2.png",
  },
]

const footerColumns = [
  { heading: "Product", links: ["How it works", "Occasions", "Pricing", "Gift cards"] },
  { heading: "Company", links: ["About", "Careers", "Press", "Contact"] },
  { heading: "Support", links: ["Help center", "Privacy", "Terms", "Status"] },
]

/* -------------------------------------------------------------------------- */
/*  Sections                                                                  */
/* -------------------------------------------------------------------------- */

function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="size-4 text-primary-foreground" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight text-foreground">MemoryPop</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/create"
            className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            See a MemoryPop
          </Link>
          <Link
            href="/create"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start a MemoryPop
          </Link>
        </div>

        <button
          className="inline-flex size-11 items-center justify-center rounded-xl text-foreground md:hidden active:ring-2 active:ring-primary active:ring-offset-2 transition-all"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary active:bg-secondary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <OutlineButton className="w-full">See a MemoryPop</OutlineButton>
            <PrimaryButton className="w-full">Start a MemoryPop</PrimaryButton>
          </div>
        </div>
      )}
    </header>
  )
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[340px]">
      {/* Floating accent badges */}
      <div className="absolute -left-6 top-24 z-20 hidden rotate-[-8deg] items-center gap-2 rounded-full bg-card px-4 py-2 shadow-xl shadow-primary/10 ring-1 ring-border sm:flex">
        <Heart className="size-4 text-primary" />
        <span className="text-sm font-medium text-foreground">42 messages</span>
      </div>
      <div className="absolute -right-8 bottom-32 z-20 hidden rotate-[6deg] items-center gap-2 rounded-full bg-primary px-4 py-2 shadow-xl shadow-primary/25 sm:flex">
        <Sparkles className="size-4 text-primary-foreground" />
        <span className="text-sm font-medium text-primary-foreground">AI recap ready</span>
      </div>

      {/* Phone frame */}
      <div className="relative overflow-hidden rounded-[2.75rem] border-[10px] border-foreground/90 bg-foreground/90 shadow-2xl shadow-primary/20">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-30 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-foreground/90" />

        {/* Screen */}
        <div className="scrollbar-none relative h-[620px] overflow-y-auto rounded-[2rem] bg-background">
          {/* Cover */}
          <div className="relative h-64 w-full">
            <img
              src="/images/birthday-cover.png"
              alt="Emma laughing while blowing out her birthday candles"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground">
                <Sparkles className="size-3" />
                Birthday MemoryPop
              </span>
              <h3 className="mt-2 font-heading text-2xl font-semibold text-background text-balance">Emma turns 30!</h3>
            </div>
          </div>

          {/* Contributors */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex -space-x-2">
              {contributors.map((c) => (
                <img
                  key={c.name}
                  src={c.src || "/placeholder.svg"}
                  alt={c.name}
                  className="size-8 rounded-full object-cover ring-2 ring-background"
                />
              ))}
              <span className="flex size-8 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground ring-2 ring-background">
                +38
              </span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">contributing</span>
          </div>

          {/* Messages */}
          <div className="space-y-3 px-4 pb-8">
            {messages.map((m, i) => (
              <div key={i} className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-2">
                  <img src={m.src || "/placeholder.svg"} alt={m.name} className="size-7 rounded-full object-cover" />
                  <span className="text-sm font-semibold text-foreground">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.time}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80 text-pretty">{m.text}</p>
                {m.photo && (
                  <img
                    src={m.photo || "/placeholder.svg"}
                    alt="Shared memory"
                    className="mt-2 h-28 w-full rounded-xl object-cover"
                  />
                )}
              </div>
            ))}

            <Link
              href="/create"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
            >
              <Heart className="size-4" />
              Add a memory for Emma
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Soft coral glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[500px] bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.9_0.08_40/0.7),transparent)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pb-24 lg:pt-20">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-border">
            <Star className="size-3.5 text-primary" />
            Powered by thoughtful AI
          </span>

          <h1 className="mt-6 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
            Create a celebration they&apos;ll never forget.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Bring together memories, photos and heartfelt messages from the people who matter most&mdash;all in one
            beautiful digital celebration.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <PrimaryButton>
              Start a MemoryPop
              <ArrowRight className="size-4" />
            </PrimaryButton>
            <OutlineButton>
              <Play className="size-4" />
              See a MemoryPop
            </OutlineButton>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">Free to start &middot; No app to download &middot; Ready in minutes</p>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <PhoneMockup />
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border/60 bg-card">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Simple by design</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
            Three steps to something they&apos;ll treasure
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="relative rounded-3xl bg-background p-8 ring-1 ring-border">
              <span className="absolute right-6 top-6 font-heading text-4xl font-semibold text-accent">{s.step}</span>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <s.Icon className="size-6" />
              </span>
              <h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground text-pretty">{s.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Celebrations() {
  return (
    <section id="occasions" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Every moment matters</p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
          Made for every celebration
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
          Whatever the occasion, MemoryPop turns scattered messages into one heartfelt keepsake.
        </p>
      </div>

      <div className="mt-14 grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-4">
        {occasions.map((o) => (
          <article key={o.title} className={`group relative overflow-hidden rounded-3xl ring-1 ring-border ${o.span}`}>
            <img
              src={o.src || "/placeholder.svg"}
              alt={o.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="font-heading text-xl font-semibold text-background sm:text-2xl">{o.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-background/85 text-pretty">{o.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function WhyLove() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">The MemoryPop feeling</p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
          Why people love MemoryPop
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
          It&apos;s not just a card. It&apos;s the feeling of being surrounded by everyone who loves you.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <f.Icon className="size-5" />
            </span>
            <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground text-pretty">{f.copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex flex-col justify-between rounded-3xl bg-primary/5 p-8 ring-1 ring-primary/15">
            <blockquote className="font-heading text-xl leading-snug text-foreground text-pretty">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <img src={t.src || "/placeholder.svg"} alt={t.name} className="size-11 rounded-full object-cover ring-2 ring-background" />
              <span>
                <span className="block font-semibold text-foreground">{t.name}</span>
                <span className="block text-sm text-muted-foreground">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section id="start" className="px-5 pb-20 sm:px-6 lg:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-primary px-6 py-16 text-center sm:px-10 sm:py-24">
        {/* subtle glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,oklch(1_0_0/0.18),transparent)]" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold leading-[1.1] tracking-tight text-primary-foreground text-balance sm:text-4xl lg:text-5xl">
            The people they love, all in one place.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-primary-foreground/85 text-pretty">
            Give someone the gift of feeling truly celebrated. Start a MemoryPop today and gather the moments that
            matter&mdash;before the moment passes.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/create"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-secondary px-7 text-base font-medium text-secondary-foreground transition-colors hover:bg-secondary/90 sm:w-auto"
            >
              Start a MemoryPop
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/create"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full border border-primary-foreground/30 bg-transparent px-7 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10 sm:w-auto"
            >
              <Play className="size-4" />
              See a MemoryPop
            </Link>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/70">Free to start &middot; No credit card required</p>
        </div>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <a href="#top" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="size-4 text-primary-foreground" />
              </span>
              <span className="font-heading text-xl font-semibold tracking-tight text-foreground">MemoryPop</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
              Beautiful, collaborative celebrations that bring the people who matter most together.
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold text-foreground">{col.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground active:bg-secondary rounded px-2 py-1">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MemoryPop. Made with love.</p>
          <div className="flex gap-5">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground active:bg-secondary rounded px-2 py-1 transition-colors">Instagram</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground active:bg-secondary rounded px-2 py-1 transition-colors">TikTok</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground active:bg-secondary rounded px-2 py-1 transition-colors">Pinterest</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Page() {
  useEffect(() => {
    // Track homepage view with UTM parameters (if present)
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(param => {
      const value = urlParams.get(param);
      if (value) utmParams[param] = value;
    });

    trackEvent('homepage_viewed', utmParams);
  }, []);

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />
      <Hero />
      <HowItWorks />
      <Celebrations />
      <WhyLove />
      <FinalCta />
      <SiteFooter />
    </main>
  )
}
