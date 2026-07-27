'use client'

import { useEffect, useState } from 'react'

interface CreatorPerspectiveSectionProps {
  steps: string[]
  creatorName: string
  recipientName: string
}

export function CreatorPerspectiveSection({
  steps,
  creatorName,
  recipientName,
}: CreatorPerspectiveSectionProps) {
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
      { threshold: 0.2 }
    )

    const section = document.getElementById('creator-perspective')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  // Visual hints for each step (product-focused, not marketing)
  const stepIcons = ['🔗', '💬', '🎁']

  return (
    <section
      id="creator-perspective"
      className="py-16 px-6 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50"
    >
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2
          className={`text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          How {creatorName} made this
        </h2>
        <p
          className={`text-center text-gray-600 mb-12 transition-all duration-500 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Three simple steps. Four days. One unforgettable celebration.
        </p>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const [title, subtitle] = step.split('\n')
            return (
              <div
                key={idx}
                className={`relative p-6 bg-white rounded-2xl shadow-md text-center transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${(idx + 2) * 150}ms` }}
              >
                {/* Step Icon (subtle product hint) */}
                <div className="text-3xl mb-3 opacity-90">{stepIcons[idx]}</div>

                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-white font-bold text-lg mb-4">
                  {idx + 1}
                </div>

                {/* Step Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </div>
            )
          })}
        </div>

        {/* Bottom Message */}
        <p
          className={`text-center text-lg text-gray-700 font-medium mt-12 transition-all duration-500 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Simple for {creatorName}. Unforgettable for {recipientName}.
        </p>
      </div>
    </section>
  )
}
