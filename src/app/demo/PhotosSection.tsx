'use client'

import { useEffect, useState } from 'react'
import type { DemoPhoto } from '@/data/demos/emma-birthday'

interface PhotosSectionProps {
  photos: DemoPhoto[]
  isPremium: boolean
}

export function PhotosSection({ photos, isPremium }: PhotosSectionProps) {
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
      { threshold: 0.1 }
    )

    const section = document.getElementById('photos-section')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="photos-section"
      className="py-16 px-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"
    >
      <div className="max-w-6xl mx-auto">
        <h2
          className={`text-3xl font-bold text-center text-gray-900 mb-12 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Captured Moments
        </h2>

        {/* Masonry Grid */}
        <div
          className={`grid grid-cols-2 md:grid-cols-3 transition-all duration-400 ${
            isPremium ? 'gap-6' : 'gap-3'
          }`}
        >
          {photos.map((photo, idx) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isPremium={isPremium}
              index={idx}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface PhotoCardProps {
  photo: DemoPhoto
  isPremium: boolean
  index: number
  isVisible: boolean
}

function PhotoCard({ photo, isPremium, index, isVisible }: PhotoCardProps) {
  // Create varied heights for masonry effect
  const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-60', 'h-52']
  const heightClass = heights[index % heights.length]

  const baseClasses = `relative overflow-hidden transition-all duration-400 ${heightClass}`
  const premiumClasses = isPremium
    ? 'rounded-2xl shadow-2xl hover:scale-[1.02] border-8 border-white'
    : 'rounded-xl shadow-md'

  return (
    <div
      className={`${baseClasses} ${premiumClasses} transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Placeholder for actual photo */}
      <div className="w-full h-full bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 flex items-center justify-center">
        <div className="text-center text-white p-4">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-xs font-medium opacity-90">{photo.alt}</p>
        </div>
      </div>

      {/* Caption - Always visible in Premium */}
      {isPremium && photo.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white text-sm font-medium leading-tight">{photo.caption}</p>
        </div>
      )}
    </div>
  )
}
