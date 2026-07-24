# Feature Spec: Public Website & SEO Foundations (Phase 1 - REVISED)

**Date:** 2026-07-24 (Revised after Founder feedback)
**Feature:** Complete Company Website
**Scope:** 12 static pages + footer update
**Approved by:** Product Owner (20/25), Founder (with strategic refinement)

---

## Founder Strategic Refinement

**Original Plan:** Build 7 essential pages, remove 5 footer links (Occasions, Pricing, Careers, Press, Gift Cards)

**Founder Decision:** Build complete company website with 12 pages, only remove Gift Cards

**Reasoning:**
> "A small but genuine page is better than removing navigation. I want MemoryPop to feel like a complete company, not just a web application."

**Revised Scope:**
- **Keep all 12 footer links** (remove only Gift Cards)
- **Build minimal but genuine pages** for Careers, Press, Occasions, Pricing
- **Goal:** Professional, complete company presence

---

## Request

Build complete public website for MemoryPop by creating **12 pages** that resolve all active footer links. Current state: all 13 footer links go nowhere (href="#").

**Goal:** MemoryPop should feel like a complete, professional company with genuine public pages.

---

## Goal

### User Goal
- Click any footer link and find a genuine, helpful page
- Understand what MemoryPop does and how it works
- Learn about pricing and occasions
- See MemoryPop as a real company (not just an app)
- Get answers to common questions without emailing support

### Business Goal
- Present MemoryPop as a complete, credible company
- Enable organic search discovery
- Reduce support burden via self-serve help
- Establish foundation for future SEO growth (occasions hub)
- Create professional presence for partnerships and press

---

## Current State

**Footer Links (13 total):**
```
Product: How it works | Occasions | Pricing | Gift cards
Company: About | Careers | Press | Contact
Support: Help center | Privacy | Terms | Status
```

**Reality:**
- All links use `href="#"` (go nowhere)
- No public pages exist beyond homepage and application flows
- Zero organic discoverability
- Users clicking footer hit dead ends

**Source:** `src/app/page.tsx` lines 310-314 (footerColumns array)

---

## In Scope (Phase 1 - REVISED)

### Pages to Create (10 new pages)

**Product Section (3 pages):**
1. `/how-it-works` - Explain MemoryPop in 5 steps
2. `/occasions` - Overview of celebrations MemoryPop supports (hub for future SEO pages)
3. `/pricing` - Standard, Premium, Keepsake pricing

**Company Section (4 pages):**
4. `/about` - Mission, story, values
5. `/careers` - Not hiring but interested in meeting thoughtful people
6. `/press` - Brand overview + press contact
7. `/contact` - 3 email categories

**Support Section (3 pages):**
8. `/help-center` - 6 core FAQs
9. `/status` - System operational status
10. `/privacy` - Privacy policy (audit/create)
11. `/terms` - Terms of service (audit/create)

### Footer Update
12. Update `footerColumns` array in `src/app/page.tsx`:
   - **Remove:** Gift cards only
   - **Keep:** All 12 other links
   - Update all links from `href="#"` to actual routes

---

## Out of Scope (Phase 1)

**Deferred to Phase 2+:**
- ❌ Occasion-specific SEO landing pages (/birthday-memory-book, etc.)
- ❌ Blog structure
- ❌ Contact form (email links only for Phase 1)
- ❌ Search functionality
- ❌ Dynamic status monitoring
- ❌ User testimonials / social proof
- ❌ FAQ search or filtering
- ❌ Multi-language support
- ❌ CMS integration
- ❌ Detailed pricing calculator
- ❌ Press kit downloads (logos, assets)

---

## Files to Create

### New Page Routes (10 files)

**Product Section:**
1. `src/app/how-it-works/page.tsx` - 5-step process
2. `src/app/occasions/page.tsx` - Celebrations overview
3. `src/app/pricing/page.tsx` - Three-tier pricing

**Company Section:**
4. `src/app/about/page.tsx` - Mission and story
5. `src/app/careers/page.tsx` - Not hiring but open
6. `src/app/press/page.tsx` - Brand + press contact
7. `src/app/contact/page.tsx` - Contact options

**Support Section:**
8. `src/app/help-center/page.tsx` - 6 FAQs
9. `src/app/status/page.tsx` - Operational status
10. `src/app/privacy/page.tsx` - Privacy policy (if doesn't exist)
11. `src/app/terms/page.tsx` - Terms of service (if doesn't exist)

---

## Files to Modify

### `src/app/page.tsx` (lines 310-314)

**Current:**
```typescript
const footerColumns = [
  { heading: "Product", links: ["How it works", "Occasions", "Pricing", "Gift cards"] },
  { heading: "Company", links: ["About", "Careers", "Press", "Contact"] },
  { heading: "Support", links: ["Help center", "Privacy", "Terms", "Status"] },
]
```

**Change to:**
```typescript
const footerColumns = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Occasions", href: "/occasions" },
      { label: "Pricing", href: "/pricing" }
    ]
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" }
    ]
  },
  {
    heading: "Support",
    links: [
      { label: "Help center", href: "/help-center" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Status", href: "/status" }
    ]
  },
]
```

**Note:** Gift cards link removed. All other links present with real routes.

---

## Page Specifications

### 1. How It Works (`/how-it-works`)

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'How MemoryPop Works',
  description: 'Learn how MemoryPop helps you collect memories from loved ones and create a beautiful keepsake book in 5 simple steps.',
  openGraph: {
    title: 'How MemoryPop Works',
    description: 'Learn how MemoryPop helps you collect memories from loved ones and create a beautiful keepsake book in 5 simple steps.',
    url: '/how-it-works',
  },
};
```

**Copy:**
```markdown
# How MemoryPop Works

Create a beautiful celebration in 5 simple steps

---

## 1. Create Your MemoryPop ✨

Choose the occasion you're celebrating, add a personal message to your recipient, and give your MemoryPop a name. The whole process takes less than 2 minutes.

---

## 2. Invite Contributors 📨

Share a unique link with friends, family, colleagues, or anyone you want to include. Anyone with the link can contribute—no signup required.

---

## 3. Contributors Add Memories 💝

Contributors write personal messages, upload photos, choose emojis that capture the mood, and add their memories. Each contribution becomes part of something beautiful.

---

## 4. You Collect and Curate 🎁

Access your creator dashboard anytime to review submissions and see who's contributed. You control when the MemoryPop is ready to reveal.

---

## 5. Reveal and Treasure Forever 🎉

Share the completed MemoryPop with your recipient. They'll experience all the memories in one beautiful place. Keep it as a digital keepsake forever.

---

## Ready to create your first MemoryPop?

[Create Your MemoryPop]

Have questions? Visit our [Help Center](/help-center)
Explore celebrations we support: [Occasions](/occasions)
```

---

### 2. Occasions (`/occasions`) — NEW

**Purpose:** Overview page for all celebrations MemoryPop supports. Future hub for occasion-specific SEO landing pages.

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Occasions',
  description: 'Celebrate every meaningful moment with MemoryPop. Birthdays, weddings, farewells, retirements, and more—collect memories together.',
  openGraph: {
    title: 'Occasions | MemoryPop',
    description: 'Celebrate every meaningful moment with MemoryPop. Birthdays, weddings, farewells, retirements, and more—collect memories together.',
    url: '/occasions',
  },
};
```

**Copy:**
```markdown
# Occasions

Every celebration deserves one beautiful home

---

MemoryPop helps you celebrate life's meaningful moments by collecting memories from the people who matter most.

Whether you're celebrating a birthday, marking a milestone, saying goodbye, or just saying thank you—MemoryPop brings everyone together in one beautiful place.

---

## Celebrations We Support

**Birthdays**
Collect birthday wishes, funny stories, and favorite memories from friends and family.

**Farewells**
Create a thoughtful send-off for colleagues, friends, or loved ones moving on to new adventures.

**Retirements**
Celebrate a career well-lived with memories, thank-yous, and messages from coworkers.

**Weddings**
Gather well-wishes and advice for the happy couple from friends and family.

**Anniversaries**
Mark special milestones with memories and messages celebrating your journey together.

**New Arrivals**
Welcome a new baby with messages of love, hope, and wisdom from family and friends.

**Thank You**
Show appreciation for teachers, mentors, coaches, or anyone who's made a difference.

**Graduations**
Celebrate achievements with messages of congratulations and encouragement for the future.

**And more...**
Whatever the occasion, MemoryPop helps you celebrate together.

---

## How It Works

1. Choose your occasion
2. Invite contributors
3. Collect memories
4. Reveal and treasure forever

[Create Your MemoryPop]

Want to see the process? [How it works](/how-it-works)
```

**Design Notes:**
- Keep list format simple (no heavy visuals needed for Phase 1)
- Each occasion is a brief 1-sentence description
- Future: Each occasion name can become link to dedicated SEO page (/birthday-memory-book, etc.)
- Expandable: Easy to add more occasions as product grows

---

### 3. Pricing (`/pricing`) — NEW

**Purpose:** Explain MemoryPop's three-tier pricing model (Standard, Premium, Keepsake)

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Pricing',
  description: 'MemoryPop pricing: Standard (free), Premium (enhanced features), and Keepsake (physical memory book). Celebrate together, your way.',
  openGraph: {
    title: 'Pricing | MemoryPop',
    description: 'MemoryPop pricing: Standard (free), Premium (enhanced features), and Keepsake (physical memory book). Celebrate together, your way.',
    url: '/pricing',
  },
};
```

**Copy:**
```markdown
# Pricing

Simple, transparent pricing for every celebration

---

## Standard
**Free forever**

Perfect for most celebrations.

**Includes:**
- Unlimited contributors
- Text, photos, and emojis
- Creator dashboard
- Digital MemoryPop forever
- Share link anytime

[Create for Free]

---

## Premium
**Coming soon**

Enhanced features for special celebrations.

**Everything in Standard, plus:**
- Premium themes and styles
- Video messages
- Advanced customization
- Priority support

Pricing to be announced.

---

## Keepsake
**Coming soon**

Turn your digital MemoryPop into a beautiful physical book.

**Everything in Premium, plus:**
- Professional printed memory book
- Premium paper and binding
- Delivered to your door
- Keep the digital version forever

Pricing to be announced.

---

## Questions about pricing?

[Contact us](/contact) or visit our [Help Center](/help-center)

Ready to start? [Create Your MemoryPop]
```

**Design Notes:**
- Three-column layout on desktop (single column mobile)
- Standard tier: Fully detailed (this is the current product)
- Premium/Keepsake: "Coming soon" with feature teasers
- No fake pricing (only show real pricing when available)
- CTA emphasizes free tier

**Founder Note:**
If you want to show actual Premium/Keepsake pricing now, provide the details and I'll update the copy. Otherwise "Coming soon" maintains honesty while showing product vision.

---

### 4. About (`/about`)

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'About MemoryPop',
  description: 'MemoryPop helps people celebrate life\'s meaningful moments together by collecting memories in one beautiful place.',
  openGraph: {
    title: 'About MemoryPop',
    description: 'MemoryPop helps people celebrate life\'s meaningful moments together by collecting memories in one beautiful place.',
    url: '/about',
  },
};
```

**Copy:**
```markdown
# About MemoryPop

Celebrating life's meaningful moments, together

---

## Our Mission

We help people celebrate life's meaningful moments together by collecting memories in one beautiful place.

Every celebration deserves more than a store-bought card. It deserves a collection of genuine memories, heartfelt messages, and moments captured by the people who matter most.

---

## Why MemoryPop Exists

Celebrations bring people together—but the memories often get scattered across texts, emails, and social media, then lost.

We built MemoryPop to change that.

MemoryPop is a place where everyone who cares can contribute to something meaningful. A birthday. A farewell. A wedding. A thank you. Whatever the occasion, MemoryPop helps you collect the memories that matter and keep them in one beautiful place, forever.

---

## What We Believe

**Every celebration deserves one beautiful home**
Not scattered across 20 different platforms, but collected in one thoughtful place.

**Memories are made together**
The best celebrations aren't created alone. They're built by everyone who cares.

**Emotion before technology**
We build tools that feel warm and human, not cold and complicated.

**Simplicity is a feature**
Creating something meaningful shouldn't require a manual.

---

## Start celebrating together

[Create Your MemoryPop]

Questions? [Get in touch](/contact)
Interested in joining us? [Careers](/careers)
```

---

### 5. Careers (`/careers`) — NEW

**Purpose:** Professional presence even when not hiring. Warm invitation for future opportunities.

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Careers at MemoryPop',
  description: 'We\'re not hiring today, but we\'re always interested in meeting thoughtful people building products that help people celebrate life\'s meaningful moments.',
  openGraph: {
    title: 'Careers at MemoryPop',
    description: 'We\'re not hiring today, but we\'re always interested in meeting thoughtful people building products that help people celebrate life\'s meaningful moments.',
    url: '/careers',
  },
};
```

**Copy:**
```markdown
# Careers at MemoryPop

---

## We're not hiring today

But we're always interested in meeting thoughtful people who are passionate about building products that help people celebrate life's meaningful moments.

---

## What We Value

**Thoughtful craft**
We care deeply about the details that make products feel warm and human.

**Genuine empathy**
We build for real people experiencing real emotions during real celebrations.

**Elegant simplicity**
The best solutions are often the simplest ones.

**Meaningful impact**
We measure success by the celebrations we help create, not the features we ship.

---

## Interested in MemoryPop?

We'd love to hear from you.

Send us a note at [hello@memorypop.com](mailto:hello@memorypop.com)

Tell us what you're working on and why you're interested in what we're building.

---

Learn more [about MemoryPop](/about)
```

**Design Notes:**
- Honest and direct (no fake job listings)
- Warm invitation (not cold rejection)
- Shows company values
- Provides clear action (email hello@)
- Professional without being corporate

---

### 6. Press (`/press`) — NEW

**Purpose:** Brand overview and press contact for journalists, bloggers, partners.

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Press',
  description: 'MemoryPop press information: Brand overview, company details, and press contact.',
  openGraph: {
    title: 'Press | MemoryPop',
    description: 'MemoryPop press information: Brand overview, company details, and press contact.',
    url: '/press',
  },
};
```

**Copy:**
```markdown
# Press

---

## About MemoryPop

MemoryPop helps people celebrate life's meaningful moments together by collecting memories from friends, family, and loved ones in one beautiful place.

Whether it's a birthday, farewell, wedding, retirement, or any special occasion—MemoryPop brings everyone together to create something meaningful that lasts forever.

---

## Company Overview

**Founded:** 2024
**Mission:** Help people celebrate life's meaningful moments together
**Product:** Digital memory book platform for collaborative celebrations
**Website:** [memorypop.app](https://memorypop.app)

---

## How It Works

1. **Create:** Choose an occasion and add a personal message
2. **Invite:** Share a link with contributors (no signup required)
3. **Collect:** Contributors add memories, photos, and messages
4. **Reveal:** Share the completed MemoryPop with the recipient
5. **Treasure:** Keep it as a digital keepsake forever

---

## Brand Description

MemoryPop is a digital celebration platform that helps people collect memories from the people who matter most. It's designed for birthdays, farewells, weddings, retirements, and any meaningful moment worth celebrating together.

Unlike traditional greeting cards or scattered social media posts, MemoryPop creates one beautiful home for all the memories, messages, and moments that make a celebration special.

---

## Press Contact

For press inquiries, interviews, or partnership opportunities:

**Email:** [partnerships@memorypop.com](mailto:partnerships@memorypop.com)

We typically respond within 24-48 hours.

---

## Press Resources

Brand assets, logos, and screenshots coming soon.

For immediate needs, please contact [partnerships@memorypop.com](mailto:partnerships@memorypop.com)

---

Learn more [about MemoryPop](/about)
```

**Design Notes:**
- Professional but approachable
- Key facts easily scannable
- Clear press contact
- Placeholder for future press kit (logos, screenshots, etc.)
- Can expand over time as press coverage grows

---

### 7. Contact (`/contact`)

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Contact MemoryPop',
  description: 'Get in touch with the MemoryPop team for support, partnerships, or general inquiries.',
  openGraph: {
    title: 'Contact MemoryPop',
    description: 'Get in touch with the MemoryPop team for support, partnerships, or general inquiries.',
    url: '/contact',
  },
};
```

**Copy:**
```markdown
# Contact Us

We'd love to hear from you

---

## General Inquiries 💬

**[hello@memorypop.com](mailto:hello@memorypop.com)**

For general questions, feedback, or just saying hi.

---

## Support 🆘

**[support@memorypop.com](mailto:support@memorypop.com)**

For technical issues, account help, or questions about your MemoryPop.

---

## Partnerships & Business 🤝

**[partnerships@memorypop.com](mailto:partnerships@memorypop.com)**

For business inquiries, press requests, or partnership opportunities.

---

We aim to respond within 24-48 hours.

Looking for quick answers? [Try our Help Center first](/help-center)
```

---

### 8. Help Center (`/help-center`)

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Get answers to common questions about creating MemoryPops, inviting contributors, and managing your celebrations.',
  openGraph: {
    title: 'Help Center | MemoryPop',
    description: 'Get answers to common questions about creating MemoryPops, inviting contributors, and managing your celebrations.',
    url: '/help-center',
  },
};
```

**Copy:**
```markdown
# Help Center

Answers to common questions

---

## How do I create a MemoryPop?

Click "Create Your MemoryPop" on the homepage, choose an occasion, add a personal message, and give your MemoryPop a name. You'll get a unique link to share with contributors and a creator dashboard link emailed to you.

---

## How do contributors add memories?

Share your MemoryPop link with anyone you want to include. They click the link, write their message, optionally upload a photo, choose an emoji, and submit. No signup required.

---

## Can I edit my MemoryPop after creating it?

Yes. Access your creator dashboard using the link sent to your email. From there, you can edit your personal message, update the occasion, or change the MemoryPop name.

---

## How do I access my creator dashboard?

Check your email for the creator dashboard link (sent when you create your MemoryPop). You can also access it by entering your email on the homepage if you've lost the link.

---

## Can contributors add photos?

Yes. Contributors can upload one photo per memory. We support JPEG, PNG, and HEIC formats. Photos are automatically optimized for web viewing.

---

## Is MemoryPop free?

Yes. Creating a MemoryPop and collecting memories is completely free. We may offer premium features (like physical keepsake books) in the future, but the core experience will always be free.

---

**Still have questions?**

[Contact us](/contact) — we're happy to help.
```

---

### 9. Status (`/status`)

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'System Status',
  description: 'Check the current operational status of MemoryPop services.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'System Status | MemoryPop',
    description: 'Check the current operational status of MemoryPop services.',
    url: '/status',
  },
};
```

**Copy:**
```markdown
# System Status

Current operational status

---

## ✅ All Systems Operational

---

### Service Status

**Website:** ✅ Operational
**Memory Creation:** ✅ Operational
**Contributor Access:** ✅ Operational
**Email Notifications:** ✅ Operational

---

**Last updated:** July 24, 2026

Experiencing issues? Contact us at [support@memorypop.com](mailto:support@memorypop.com)
```

---

### 10. Privacy (`/privacy`)

**Action:** Audit if exists, create if doesn't exist using standard privacy policy template.

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'MemoryPop\'s privacy policy explains how we collect, use, and protect your data.',
  openGraph: {
    title: 'Privacy Policy | MemoryPop',
    description: 'MemoryPop\'s privacy policy explains how we collect, use, and protect your data.',
    url: '/privacy',
  },
};
```

**Required Sections:**
1. Introduction
2. Information We Collect
3. How We Use Your Information
4. Data Storage and Security
5. Your Rights
6. Contact Us

---

### 11. Terms (`/terms`)

**Action:** Audit if exists, create if doesn't exist using standard terms of service template.

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'MemoryPop\'s terms of service explain the rules and guidelines for using our platform.',
  openGraph: {
    title: 'Terms of Service | MemoryPop',
    description: 'MemoryPop\'s terms of service explain the rules and guidelines for using our platform.',
    url: '/terms',
  },
};
```

**Required Sections:**
1. Acceptance of Terms
2. Description of Service
3. User Responsibilities
4. Prohibited Uses
5. Content Ownership
6. Limitation of Liability
7. Termination
8. Changes to Terms
9. Contact Us

---

## Component Pattern

All 12 pages follow this consistent structure:

```typescript
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '[Page Title]',
  description: '[Page description]',
  openGraph: {
    title: '[Page Title] | MemoryPop',
    description: '[Page description]',
    url: '/[route]',
  },
};

export default function PageName() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">[Title]</h1>
          <p className="mt-4 text-lg text-muted-foreground">[Subtitle]</p>
        </div>

        {/* Content */}
        <div className="mt-12 space-y-12">
          {/* Page-specific content */}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
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
```

---

## Implementation Steps

### Step 1: Verify Email Addresses (5 min)
- Check if hello@, support@, partnerships@ are live
- Use fallback if needed

### Step 2: Audit Existing Pages (10 min)
- Check if `/privacy` and `/terms` exist
- Read and assess completeness

### Step 3: Create Product Pages (60 min)
- Create `/how-it-works` (20 min)
- Create `/occasions` (20 min) — NEW
- Create `/pricing` (20 min) — NEW

### Step 4: Create Company Pages (60 min)
- Create `/about` (15 min)
- Create `/careers` (15 min) — NEW
- Create `/press` (15 min) — NEW
- Create `/contact` (15 min)

### Step 5: Create Support Pages (40 min)
- Create `/help-center` (20 min)
- Create `/status` (10 min)
- Create/update `/privacy` (10 min if exists, 20 if creating)
- Create/update `/terms` (10 min if exists, 20 if creating)

### Step 6: Update Footer (15 min)
- Modify `src/app/page.tsx` footer structure
- Remove Gift Cards link
- Update all other links to real routes

### Step 7: Test All Routes (30 min)
- Visit all 12 pages
- Test all footer links
- Test on mobile viewport
- Verify meta tags

**Total Estimated Implementation Time:** 4-5 hours (was 2.5-3 hours for 7 pages)

---

## Acceptance Criteria

### AC1: All 10 New Pages Exist and Load
- ✅ `/how-it-works` shows 5-step process
- ✅ `/occasions` shows celebration types
- ✅ `/pricing` shows three tiers
- ✅ `/about` shows mission and story
- ✅ `/careers` shows hiring status
- ✅ `/press` shows brand overview
- ✅ `/contact` shows 3 email options
- ✅ `/help-center` shows 6 FAQs
- ✅ `/status` shows operational status
- ✅ `/privacy` is complete (or `/terms` is complete)

### AC2: All 12 Footer Links Work
- ✅ All links resolve to real pages (no href="#")
- ✅ Gift Cards link removed

### AC3: SEO Metadata Present
- ✅ Every page has unique title and description

### AC4: Mobile Experience Excellent
- ✅ All pages readable on 375px screen

### AC5: Content Quality
- ✅ All copy follows Founder Principles (warm, honest, human)
- ✅ No placeholder text

### AC6: Build Succeeds
- ✅ `npm run build` completes without errors

### AC7: Existing Functionality Unaffected
- ✅ Homepage, creation flow, dashboard still work

---

## Risks

### Risk 1: More Pages = Longer Implementation
**Probability:** HIGH
**Impact:** LOW (more time, but still achievable)
**Mitigation:** 12 pages is manageable (4-5 hours total)
**Budget:** Still well within daily cap

### Risk 2: Pricing Page May Need Updates Soon
**Probability:** MEDIUM
**Impact:** LOW (easy to update copy)
**Mitigation:** "Coming soon" for Premium/Keepsake is honest
**Rollback:** Update copy only if pricing changes

### Risk 3: Careers/Press Pages May Feel Thin
**Probability:** LOW
**Impact:** LOW (intentionally minimal for Phase 1)
**Mitigation:** Founder feedback confirms "small but genuine" is the goal
**Rollback:** Not needed (working as intended)

---

## Specification Status

✅ **REVISED AND COMPLETE**

**Changes from Original Spec:**
- **Pages:** 7 → 12 (added Occasions, Pricing, Careers, Press)
- **Footer links:** 7 → 12 (only Gift Cards removed)
- **Implementation time:** 2.5-3 hours → 4-5 hours
- **Reasoning:** Complete company website, not just essential pages

**Next Step:** Founder approval, then proceed to Implementation.

---

**Estimated Implementation Time:** 4-5 hours
**Risk Level:** Very Low
**Complexity:** Medium (more pages, but all static)
**Dependencies:** None
**Budget:** ~$15-25 (Sonnet 4.5), well within $191.50 remaining
