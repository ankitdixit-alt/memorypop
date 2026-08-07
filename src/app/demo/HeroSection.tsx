'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleCtaClick = () => {
    trackEvent('demo_hero_cta_clicked', {
      location: 'hero',
    })
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-6 py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Headline */}
        <h1
          className={`text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          The most meaningful gifts are not bought.
          <br />
          <span className="text-orange-600">They are created together.</span>
        </h1>

        {/* Visual Element - Simplified */}
        <div
          className={`my-12 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="relative w-full max-w-2xl mx-auto h-64 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-orange-100 to-pink-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-7xl mb-4">💝</div>
                <p className="text-lg text-gray-700 font-medium">
                  Everyone you love, one unforgettable surprise
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/create"
          onClick={handleCtaClick}
          className={`inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xl font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms', transitionDuration: '700ms' }}
        >
          Create a MemoryPop
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
