'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

interface CtaSectionProps {
  occasion: string
}

export function CtaSection({ occasion }: CtaSectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
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

    const section = document.getElementById('cta-section')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const handleCtaClick = () => {
    trackEvent('demo_cta_clicked', {
      occasion,
    })
  }

  return (
    <section
      id="cta-section"
      className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Headline */}
        <h2
          className={`text-3xl md:text-5xl font-bold mb-4 leading-tight transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          The people they love, all in one place.
        </h2>

        {/* Supporting Copy */}
        <p
          className={`text-xl text-gray-300 mb-10 leading-relaxed transition-all duration-600 delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Every celebration deserves to be remembered. Every person deserves to feel this
          loved.
        </p>

        {/* Primary CTA */}
        <Link
          href={`/create?occasion=${occasion}`}
          onClick={handleCtaClick}
          className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '300ms', transitionDuration: '600ms' }}
        >
          Create one for someone you love
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Reassurance */}
        <p
          className={`mt-6 text-sm text-gray-400 transition-all duration-600 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Free to start • Ready in 2 minutes
        </p>
      </div>
    </section>
  )
}
