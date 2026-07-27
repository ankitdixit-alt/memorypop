"use client"

import { useState, useEffect, useRef } from 'react'
import { emmaBirthdayDemo } from '@/data/demos/emma-birthday'
import { trackEvent } from '@/lib/analytics'
import { WelcomeSection } from './WelcomeSection'
import { CoverSection } from './CoverSection'
import { MessagesSection } from './MessagesSection'
import { PhotosSection } from './PhotosSection'
import { PremiumToggleSection } from './PremiumToggleSection'
import { RecipientReactionSection } from './RecipientReactionSection'
import { CreatorPerspectiveSection } from './CreatorPerspectiveSection'
import { CtaSection } from './CtaSection'

export default function DemoPage() {
  const [isPremium, setIsPremium] = useState(false)
  const [messagesExpanded, setMessagesExpanded] = useState(false)
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
        premium_viewed: isPremium,
        messages_expanded: messagesExpanded,
      })
    }
  }, [scrollDepthTracked, isPremium, messagesExpanded])

  const handlePremiumToggle = (newIsPremium: boolean) => {
    setIsPremium(newIsPremium)
    trackEvent('demo_premium_toggled', {
      to_premium: newIsPremium,
      occasion: emmaBirthdayDemo.occasion,
    })
  }

  const handleMessagesExpanded = () => {
    setMessagesExpanded(true)
    trackEvent('demo_see_more_clicked', {
      occasion: emmaBirthdayDemo.occasion,
    })
  }

  return (
    <main ref={pageRef} className="min-h-screen bg-white">
      <WelcomeSection demo={emmaBirthdayDemo} />
      <CoverSection demo={emmaBirthdayDemo} isPremium={isPremium} />
      <MessagesSection
        messages={emmaBirthdayDemo.messages}
        isPremium={isPremium}
        onExpand={handleMessagesExpanded}
      />
      <PhotosSection photos={emmaBirthdayDemo.photos} isPremium={isPremium} />
      <PremiumToggleSection isPremium={isPremium} onToggle={handlePremiumToggle} />
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
