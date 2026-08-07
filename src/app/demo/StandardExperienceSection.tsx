'use client'

import { useEffect, useState } from 'react'
import GalleryView from '@/components/memory-experience/GalleryView'

export function StandardExperienceSection() {
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

    const section = document.getElementById('standard-experience')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  // Standard memories - text and single photo only
  const standardMemories = [
    {
      id: 'std-1',
      contributor_name: 'Sarah Chen',
      message: 'Happy birthday! I am so grateful for your friendship. Here is to another year of adventures together!',
      photo_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
      video_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'std-2',
      contributor_name: 'Michael Rodriguez',
      message: 'Wishing you the happiest of birthdays! You make every moment brighter.',
      photo_url: null,
      video_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'std-3',
      contributor_name: 'Emma Wilson',
      message: 'Celebrating you today and always! Thank you for being such an amazing person.',
      photo_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',
      video_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'std-4',
      contributor_name: 'James Kim',
      message: 'To an incredible year ahead! You inspire everyone around you.',
      photo_url: null,
      video_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'std-5',
      contributor_name: 'Lisa Martinez',
      message: 'Happy birthday! May this year bring you everything you have been dreaming of.',
      photo_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      video_url: null,
      created_at: new Date().toISOString(),
    },
  ]

  const mockMemoryPop = {
    id: 'standard-demo',
    recipient_name: 'Emma',
    occasion: 'Birthday',
    story: 'A beautiful shared memory',
    share_code: 'standard-demo',
    cover_style: 'warm',
    tone: 'heartfelt',
    is_premium: false,
    celebration_date: new Date().toISOString(),
    cover_photo_url: null,
  }

  return (
    <section id="standard-experience" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            A beautiful shared memory
          </h2>
          <p
            className={`text-xl text-gray-600 max-w-3xl mx-auto mb-3 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Standard gives you everything you need to create something meaningful
          </p>
          <p
            className={`text-lg text-gray-500 italic transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            This is already a complete experience
          </p>
        </div>

        {/* Features */}
        <div
          className={`max-w-4xl mx-auto mb-12 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: '👥', label: 'Unlimited contributors' },
              { icon: '💬', label: 'Text memories' },
              { icon: '📸', label: 'One photo per person' },
              { icon: '🎨', label: 'Beautiful Memory Wall' },
              { icon: '✨', label: 'Elegant reveal' },
              { icon: '👆', label: 'Swipe navigation' },
              { icon: '❤️', label: 'Recipient reactions' },
              { icon: '🔄', label: 'Replay anytime' },
              { icon: '📄', label: 'PDF download' },
            ].map((feature, idx) => (
              <div key={idx} className="p-4">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <p className="text-sm font-medium text-gray-700">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Memory Wall Preview */}
        <div
          className={`transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <GalleryView
            memoryPop={mockMemoryPop}
            memories={standardMemories}
            shareLink="https://memorypop.app/demo"
          />
        </div>
      </div>
    </section>
  )
}
