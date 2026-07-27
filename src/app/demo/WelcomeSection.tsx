'use client'

import { useEffect, useState } from 'react'
import type { Demo } from '@/data/demos/emma-birthday'

interface WelcomeSectionProps {
  demo: Demo
}

export function WelcomeSection({ demo }: WelcomeSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Immediately show content if reduced motion is preferred
    if (mediaQuery.matches) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    const section = document.getElementById('welcome-section')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="welcome-section"
      className="relative min-h-[400px] flex items-center justify-center px-6 py-20 bg-gradient-to-br from-orange-50 via-white to-pink-50"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h1
          className={`text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 ${
            prefersReducedMotion
              ? ''
              : `transition-all duration-600 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`
          }`}
        >
          {demo.stats.contributors} people created something special for{' '}
          {demo.recipient.name}&rsquo;s {demo.recipient.age}th birthday
        </h1>
        <p
          className={`text-xl text-gray-600 ${
            prefersReducedMotion
              ? ''
              : `transition-all duration-600 delay-200 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`
          }`}
        >
          Scroll to experience what they made together
        </p>
      </div>
    </section>
  )
}
