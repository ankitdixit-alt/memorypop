'use client'

import { useEffect, useState } from 'react'
import GalleryView from '@/components/memory-experience/GalleryView'

export function PremiumExperienceSection() {
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

    const section = document.getElementById('premium-experience')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  // Premium memories - multiple photos, videos, GIFs
  const premiumMemories = [
    {
      id: 'prem-1',
      contributor_name: 'Maya Chen',
      message: 'Happy 30th birthday! Remember that road trip to Portland? You make every moment an adventure!',
      photo_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
      video_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'prem-2',
      contributor_name: 'Rachel Kim',
      message: 'Two beautiful moments from our adventures together! Happy birthday!',
      photo_url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&auto=format&fit=crop&q=80',
      video_url: null,
      created_at: new Date().toISOString(),
      multiple_photos: [
        'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&auto=format&fit=crop&q=80'
      ],
    },
    {
      id: 'prem-3',
      contributor_name: 'Sophie Laurent',
      message: 'Celebrating you today! You deserve all the happiness in the world!',
      photo_url: 'https://media.giphy.com/media/g5R9dok94mrIvplmZd/giphy.gif',
      video_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'prem-4',
      contributor_name: 'Lisa Martinez',
      message: 'Three perfect snapshots from our time together! Happy birthday!',
      photo_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      video_url: null,
      created_at: new Date().toISOString(),
      multiple_photos: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80'
      ],
    },
    {
      id: 'prem-5',
      contributor_name: 'Marcus Chen',
      message: 'Recorded a special video message for your big day! Cannot wait to celebrate!',
      photo_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      created_at: new Date().toISOString(),
    },
  ]

  const mockMemoryPop = {
    id: 'premium-demo',
    recipient_name: 'Emma',
    occasion: 'Birthday',
    story: 'A cinematic celebration',
    share_code: 'premium-demo',
    cover_style: 'warm',
    tone: 'heartfelt',
    is_premium: true,
    celebration_date: new Date().toISOString(),
    cover_photo_url: null,
  }

  return (
    <section id="premium-experience" className="py-20 px-6 bg-gradient-to-br from-orange-50/30 via-pink-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-900 shadow-lg mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="text-base">✨</span>
            Premium
          </div>
          <h2
            className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            When memories deserve more than a card
          </h2>
          <p
            className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Premium elevates the experience from beautiful to unforgettable
          </p>
        </div>

        {/* Features */}
        <div
          className={`max-w-5xl mx-auto mb-12 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: '🎬',
                title: 'Cinematic reveal',
                description: 'A storytelling experience that builds emotion with every memory',
              },
              {
                icon: '🎵',
                title: 'Beautiful soundtrack',
                description: 'Music that makes the moment even more meaningful',
              },
              {
                icon: '📸',
                title: 'Multiple photos per person',
                description: 'Let contributors share the full story, not just one moment',
              },
              {
                icon: '🎥',
                title: 'Video memories',
                description: 'Hear their voice, see their smile, feel their love',
              },
              {
                icon: '📖',
                title: 'Contributor-by-contributor storytelling',
                description: 'Each person gets their moment, each memory gets its weight',
              },
              {
                icon: '💝',
                title: 'Emotional pacing',
                description: 'Designed to build connection, not rush through',
              },
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
                <div className="text-4xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
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
            memories={premiumMemories}
            shareLink="https://memorypop.app/demo"
          />
        </div>
      </div>
    </section>
  )
}
