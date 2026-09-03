'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import MemoryGrid from '@/components/memory-experience/MemoryGrid'
import DemoMemoryPreview from './DemoMemoryPreview'
import type { Memory } from '@/components/memory-experience/types'

export function StandardExperienceSection() {
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

    const section = document.getElementById('standard-experience')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  // Standard memories - text and single photo only
  const rawMemories = [
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

  // Transform to Memory format
  const memories = useMemo<Memory[]>(() => {
    return rawMemories.map((mem: any) => {
      const hasValidPhotoUrl = mem.photo_url && mem.photo_url.trim().length > 0
      const hasValidVideoUrl = mem.video_url && mem.video_url.trim().length > 0

      let mediaType: 'photo' | 'video' | 'text' = 'text'
      if (hasValidVideoUrl) {
        mediaType = 'video'
      } else if (hasValidPhotoUrl) {
        mediaType = 'photo'
      }

      return {
        id: mem.id,
        contributorName: mem.contributor_name,
        message: mem.message,
        photoUrl: hasValidPhotoUrl ? mem.photo_url! : undefined,
        videoUrl: hasValidVideoUrl ? mem.video_url! : undefined,
        mediaType,
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
    <section id="standard-experience" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            See what they'll experience
          </h2>
          <p
            className={`text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Click any memory below to preview the experience
          </p>
        </div>

        {/* Memory Wall Preview */}
        <div
          className={`transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="bg-gradient-to-br from-[#f9f6f1] via-[#fefdfb] to-[#f5f0e8] rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-serif text-[#3a241e] mb-2">Happy Birthday Emma!</h3>
              <p className="text-lg text-[#856b5f]">Click any memory to preview</p>
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
