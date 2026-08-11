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
      description: 'Choose who you\'re celebrating',
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

  const tips = [
    {
      icon: '💭',
      title: 'Say something only you could say',
      description: 'The little stories, inside jokes and moments they may have forgotten are often the ones that mean the most.',
    },
    {
      icon: '📸',
      title: 'Bring the moment back',
      description: 'Add the photos and video that instantly take you back there.',
    },
    {
      icon: '❤️',
      title: 'Make it personal',
      description: 'A few genuine memories from the people they love can mean more than dozens of generic messages.',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* How It Works Title */}
        <h2
          className={`text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          How MemoryPop works
        </h2>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12 mb-20">
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

        {/* Divider */}
        <div className="relative mb-20">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 bg-white text-sm text-gray-500 uppercase tracking-wider font-medium">
              What makes a memory last
            </span>
          </div>
        </div>

        {/* How to Create Memories That Last */}
        <div
          className={`transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            How to create memories that last
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className={`text-center transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${600 + idx * 100}ms` }}
              >
                <div className="text-5xl mb-4">{tip.icon}</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{tip.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
