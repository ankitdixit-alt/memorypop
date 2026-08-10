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

  const tips = [
    {
      icon: '💭',
      title: 'Be specific',
      description: 'Share a real moment. "Remember when we got lost in Rome?" beats "You\'re a great friend."',
    },
    {
      icon: '📸',
      title: 'Choose photos that tell a story',
      description: 'The candid shot from that road trip means more than a perfect pose.',
    },
    {
      icon: '❤️',
      title: 'Write from the heart',
      description: 'It doesn\'t need to be perfect. Honest and personal always wins.',
    },
    {
      icon: '⏰',
      title: 'Give contributors time',
      description: 'Good memories aren\'t rushed. Send invites 2-3 weeks early.',
    },
    {
      icon: '🔒',
      title: 'Your MemoryPop stays forever',
      description: 'Come back anytime. Relive these moments on birthdays, anniversaries, or whenever you need them.',
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
              Make it meaningful
            </span>
          </div>
        </div>

        {/* How to Create Memories That Last */}
        <div
          className={`transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
            How to create memories that last
          </h3>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            A meaningful memory isn't about length or perfection. It's about connection. And with MemoryPop, these moments stay with you forever—ready to revisit whenever you need them.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${600 + idx * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{tip.icon}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
