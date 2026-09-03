'use client'

import { useEffect, useState } from 'react'

export function WhyPersonalSection() {
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

    const section = document.getElementById('why-personal')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const values = [
    {
      icon: '📸',
      title: 'Bring the moment back',
      description: 'Photos from the people who were there',
    },
    {
      icon: '🎥',
      title: 'Hear and see them again',
      description: 'Short video messages make memories feel alive',
    },
    {
      icon: '❤️',
      title: 'Everyone together',
      description: 'Messages from friends and family become one shared surprise',
    },
  ]

  return (
    <section id="why-personal" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2
          className={`text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Why it feels personal
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {values.map((value, idx) => (
            <div
              key={idx}
              className={`text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="text-6xl mb-6">{value.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-base text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
