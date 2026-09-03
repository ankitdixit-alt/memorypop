'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'
import { MEMORYPOP_PLUS } from '@/config/plus'

export function PlusTeaserSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasClickedInterest, setHasClickedInterest] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    const section = document.getElementById('plus-teaser')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const handleInterestClick = () => {
    trackEvent('premium_interest_clicked', {
      source: 'demo',
    })
    setHasClickedInterest(true)
  }

  return (
    <section id="plus-teaser" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <h2
          className={`text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Standard → MemoryPop Plus
        </h2>

        {/* Comparison Grid */}
        <div
          className={`grid md:grid-cols-2 gap-6 mb-8 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Standard Column */}
          <div className="rounded-2xl bg-white border-2 border-gray-200 p-8 shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard</h3>
              <p className="text-sm font-semibold text-gray-600">Available now · Free</p>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📸</span>
                <span className="text-base text-gray-700 pt-1">
                  {MEMORYPOP_PLUS.standard.photos} photos per contributor
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🎥</span>
                <span className="text-base text-gray-700 pt-1">
                  {MEMORYPOP_PLUS.standard.videoSeconds}-sec video per contributor
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🎵</span>
                <span className="text-base text-gray-700 pt-1">MemoryPop soundtrack</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">✨</span>
                <span className="text-base text-gray-700 pt-1">Signature MemoryPop reveal</span>
              </li>
            </ul>
          </div>

          {/* Plus Column */}
          <div className="rounded-2xl bg-gradient-to-br from-[#fff8ef] to-[#fff1e6] border-2 border-[#FFD700] p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fff1e6] text-[#ef6a57] mb-3">
                <span>✨</span>
                COMING SOON
              </div>
              <h3 className="text-2xl font-bold text-[#3a241e] mb-2">MemoryPop Plus</h3>
              <p className="text-sm font-semibold text-[#856b5f]">More room for every memory</p>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📸</span>
                <span className="text-base text-[#3a241e] font-semibold pt-1">
                  {MEMORYPOP_PLUS.plus.photos} photos per contributor
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🎥</span>
                <span className="text-base text-[#3a241e] font-semibold pt-1">
                  {MEMORYPOP_PLUS.plus.videoSeconds}-sec video per contributor
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🎵</span>
                <span className="text-base text-[#3a241e] font-semibold pt-1">Custom music</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">✨</span>
                <span className="text-base text-[#3a241e] font-semibold pt-1">Premium reveal styles</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Plus CTA */}
        <div
          className={`text-center transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-lg font-bold text-[#ef6a57] mb-4">
            {MEMORYPOP_PLUS.priceLabel} {MEMORYPOP_PLUS.price}
          </p>

          {!hasClickedInterest ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleInterestClick}
                className="rounded-full bg-[#ef6a57] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#e05a47] w-full sm:w-auto"
              >
                {MEMORYPOP_PLUS.comingSoonCTA}
              </button>
              <Link
                href="/plus"
                className="text-sm font-semibold text-[#ef6a57] underline hover:text-[#e05a47] transition-colors"
              >
                Learn more about Plus
              </Link>
            </div>
          ) : (
            <div className="text-[#2B1E18]">
              <p className="text-lg font-semibold mb-2">
                {MEMORYPOP_PLUS.comingSoonConfirmation}
              </p>
              <p className="text-[#6B5B52]">
                {MEMORYPOP_PLUS.comingSoonFollowup}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
