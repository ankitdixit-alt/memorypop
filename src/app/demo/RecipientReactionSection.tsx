'use client'

import { useEffect, useState } from 'react'

interface RecipientReactionSectionProps {
  reaction?: { photo: string; caption: string }
  recipientName: string
  stats: { contributors: number; messages: number; photos: number }
}

export function RecipientReactionSection({
  reaction,
  recipientName,
  stats,
}: RecipientReactionSectionProps) {
  if (!reaction) return null

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
      { threshold: 0.2 }
    )

    const section = document.getElementById('recipient-reaction')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="recipient-reaction"
      className="py-20 px-6 bg-gradient-to-br from-orange-50/50 via-pink-50/30 to-yellow-50/50"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        <h2
          className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          The moment {recipientName} saw this
        </h2>

        {/* Stats Line */}
        <p
          className={`text-lg md:text-xl text-gray-600 mb-3 transition-all duration-500 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {stats.contributors} people. {stats.messages} messages. {stats.photos} photos.
        </p>
        <p
          className={`text-xl md:text-2xl font-medium text-gray-800 mb-10 transition-all duration-500 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          One unforgettable moment.
        </p>

        {/* Photo - Larger, more prominent */}
        <div
          className={`relative w-full max-w-2xl mx-auto h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl mb-8 transition-all duration-600 delay-300 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            backgroundImage: 'linear-gradient(135deg, #FFF5EB 0%, #FFE4E1 50%, #FFF0DB 100%)',
          }}
        >
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

          {/* Placeholder content */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-600 p-8">
              <div className="text-7xl mb-4">🥹</div>
              <p className="text-base font-medium opacity-70">
                {recipientName}&rsquo;s reaction
              </p>
            </div>
          </div>
        </div>

        {/* Emma's Quote */}
        <blockquote
          className={`max-w-2xl mx-auto transition-all duration-500 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed mb-3">
            &ldquo;I can&rsquo;t believe you all did this... I&rsquo;m reading every single
            word.&rdquo;
          </p>
          <footer className="text-base text-gray-500">
            &mdash; {recipientName}, through happy tears
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
