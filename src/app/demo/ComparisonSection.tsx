'use client'

import { useEffect, useState } from 'react'

export function ComparisonSection() {
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

    const section = document.getElementById('comparison')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const comparisons = [
    {
      standard: 'Up to 3 photos per contributor',
      premium: 'Up to 10 photos per contributor',
    },
    {
      standard: '15-second video per contributor',
      premium: '90-second video per contributor',
    },
    {
      standard: 'MemoryPop soundtrack',
      premium: 'Upload your own music',
    },
    {
      standard: 'Signature MemoryPop look',
      premium: 'Premium frames & personalization',
    },
  ]

  return (
    <section id="comparison" className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2
          className={`text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Standard → Premium
        </h2>

        {/* Comparison Cards */}
        <div className="space-y-6">
          {comparisons.map((item, idx) => (
            <div
              key={idx}
              className={`grid md:grid-cols-2 gap-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {/* Standard */}
              <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Standard
                  </div>
                </div>
                <p className="text-lg text-gray-700 font-medium">{item.standard}</p>
              </div>

              {/* Premium */}
              <div className="p-6 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl border-2 border-orange-200 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">✨</span>
                  <div className="text-sm font-semibold text-orange-700 uppercase tracking-wider">
                    Premium
                  </div>
                </div>
                <p className="text-lg text-gray-900 font-semibold">{item.premium}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <p
          className={`text-center text-xl text-gray-600 mt-12 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Standard gives you the MemoryPop experience.
          <br />
          Premium gives you more ways to make it personal.
        </p>
      </div>
    </section>
  )
}
