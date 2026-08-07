"use client"

import { useEffect, useRef, useState } from 'react'
import { emmaBirthdayDemo } from '@/data/demos/emma-birthday'
import { trackEvent } from '@/lib/analytics'
import { HeroSection } from './HeroSection'
import { HowItWorksSection } from './HowItWorksSection'
import { StandardExperienceSection } from './StandardExperienceSection'
import { PremiumExperienceSection } from './PremiumExperienceSection'
import { ComparisonSection } from './ComparisonSection'
import { RecipientReactionSection } from './RecipientReactionSection'
import { CreatorPerspectiveSection } from './CreatorPerspectiveSection'
import { CtaSection } from './CtaSection'

export default function DemoPage() {
  const [scrollDepthTracked, setScrollDepthTracked] = useState({
    '25': false,
    '50': false,
    '75': false,
    '100': false,
  })

  const pageRef = useRef<HTMLElement>(null)

  // Track demo viewed on mount
  useEffect(() => {
    trackEvent('demo_viewed', {
      occasion: emmaBirthdayDemo.occasion,
      recipient: emmaBirthdayDemo.recipient.name,
    })
  }, [])

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      if (!pageRef.current) return

      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100

      // Track 25%, 50%, 75%, 100% scroll depths
      const depths = [
        { threshold: 25, key: '25' as const },
        { threshold: 50, key: '50' as const },
        { threshold: 75, key: '75' as const },
        { threshold: 100, key: '100' as const },
      ]

      depths.forEach(({ threshold, key }) => {
        if (scrollPercent >= threshold && !scrollDepthTracked[key]) {
          trackEvent('demo_scroll_depth', {
            depth: threshold,
            occasion: emmaBirthdayDemo.occasion,
          })
          setScrollDepthTracked(prev => ({ ...prev, [key]: true }))
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollDepthTracked])

  // Track demo completed when reaching end
  useEffect(() => {
    if (scrollDepthTracked['100']) {
      trackEvent('demo_completed', {
        occasion: emmaBirthdayDemo.occasion,
      })
    }
  }, [scrollDepthTracked])

  return (
    <main ref={pageRef} className="min-h-screen bg-white">
      <HeroSection />
      <HowItWorksSection />
      <StandardExperienceSection />
      <PremiumExperienceSection />
      <ComparisonSection />
      <RecipientReactionSection
        reaction={emmaBirthdayDemo.recipientReaction}
        recipientName={emmaBirthdayDemo.recipient.name}
        stats={emmaBirthdayDemo.stats}
      />
      <CreatorPerspectiveSection
        steps={emmaBirthdayDemo.creatorSteps}
        creatorName={emmaBirthdayDemo.creator.name}
        recipientName={emmaBirthdayDemo.recipient.name}
      />
      <CtaSection occasion={emmaBirthdayDemo.occasion} />
    </main>
  )
}
