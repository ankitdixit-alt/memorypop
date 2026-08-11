'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import MemoryGrid from '@/components/memory-experience/MemoryGrid'
import DemoMemoryPreview from './DemoMemoryPreview'
import type { Memory } from '@/components/memory-experience/types'

export function PremiumExperienceSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const scrollPositionRef = useRef<number>(0)

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
  const rawMemories = [
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
      video_url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
      created_at: new Date().toISOString(),
    },
  ]

  // Transform to Memory format
  const memories = useMemo<Memory[]>(() => {
    return rawMemories.map((mem: any) => {
      const hasValidPhotoUrl = mem.photo_url && mem.photo_url.trim().length > 0
      const hasValidVideoUrl = mem.video_url && mem.video_url.trim().length > 0
      const hasMultiplePhotos = mem.multiple_photos && Array.isArray(mem.multiple_photos) && mem.multiple_photos.length > 0

      let mediaType: 'photo' | 'video' | 'text' = 'text'
      if (hasValidVideoUrl) {
        mediaType = 'video'
      } else if (hasValidPhotoUrl || hasMultiplePhotos) {
        mediaType = 'photo'
      }

      return {
        id: mem.id,
        contributorName: mem.contributor_name,
        message: mem.message,
        photoUrl: hasValidPhotoUrl ? mem.photo_url! : undefined,
        videoUrl: hasValidVideoUrl ? mem.video_url! : undefined,
        mediaType,
        multiplePhotos: hasMultiplePhotos ? mem.multiple_photos : undefined,
        createdAt: new Date(mem.created_at),
      }
    })
  }, [])

  const handleMemoryClick = (memory: Memory) => {
    scrollPositionRef.current = window.scrollY
    setSelectedMemory(memory)
  }

  const handleModalClose = () => {
    setSelectedMemory(null)
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current)
    })
  }

  return (
    <section id="premium-experience" className="py-24 px-6 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Premium Badge with Price */}
          <div
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-base font-semibold
                        bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 text-white shadow-2xl mb-8
                        transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <span className="text-2xl">✨</span>
            <span>Premium — €4.99</span>
          </div>

          {/* Headline */}
          <h2
            className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Make it uniquely theirs
          </h2>

          {/* Subtitle */}
          <p
            className={`text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto font-medium transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            More room for every story — and more ways to make it theirs
          </p>
        </div>

        {/* Features - Customer-oriented */}
        <div
          className={`max-w-6xl mx-auto mb-16 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '📸',
                title: 'More moments, fewer compromises',
                description: 'Each person can share up to 10 favourite photos',
              },
              {
                icon: '🎥',
                title: 'More time to tell the story',
                description: 'Share a video up to 90 seconds',
              },
              {
                icon: '🎵',
                title: 'Their song. Their MemoryPop.',
                description: 'Upload music that means something to them',
              },
              {
                icon: '🎨',
                title: 'A look that feels like them',
                description: 'Choose from Premium frames and visual styles',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg hover:shadow-xl
                           transition-all duration-300 hover:-translate-y-1 border border-orange-100"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
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
          <div className="bg-gradient-to-br from-[#f9f6f1] via-[#fefdfb] to-[#f5f0e8] rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-serif text-[#3a241e] mb-2">Happy Birthday Emma!</h3>
              <p className="text-lg text-[#856b5f]">Click any memory to preview Premium experience</p>
            </div>

            <MemoryGrid memories={memories} onMemoryClick={handleMemoryClick} />
          </div>
        </div>

        {/* Demo Memory Preview Modal */}
        <DemoMemoryPreview memory={selectedMemory} isOpen={!!selectedMemory} onClose={handleModalClose} />
      </div>
    </section>
  )
}
