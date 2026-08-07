'use client'

import { useEffect, useState } from 'react'

export function HowItWorksSection() {
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

    const section = document.getElementById('how-it-works')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const steps = [
    {
      icon: '🎁',
      title: 'Create a MemoryPop',
      description: 'Choose who you are celebrating',
    },
    {
      icon: '💌',
      title: 'Invite friends and family',
      description: 'They add memories, photos, and wishes',
    },
    {
      icon: '🎉',
      title: 'Deliver one unforgettable surprise',
      description: 'Watch them experience every message',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h2
          className={`text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          How MemoryPop works
        </h2>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="text-6xl mb-6">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-base text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
