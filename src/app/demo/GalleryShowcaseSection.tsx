'use client'

import { useState } from 'react'
import GalleryView from '@/components/memory-experience/GalleryView'

interface GalleryShowcaseSectionProps {
  isPremium: boolean
}

// Sample memories showcasing new features
const demoMemories = [
  {
    id: 'demo-1',
    contributor_name: 'Maya Chen',
    message: 'Happy 30th birthday! Remember that road trip to Portland? You make every moment an adventure! 🎉',
    photo_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
    video_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    contributor_name: 'Alex Rodriguez',
    message: 'Wishing you the happiest of birthdays! Thanks for always being there when I needed someone to talk to.',
    photo_url: null,
    video_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    contributor_name: 'Sophie Laurent',
    message: 'Celebrating you today! 🎉 You deserve all the happiness in the world!',
    photo_url: 'https://media.giphy.com/media/g5R9dok94mrIvplmZd/giphy.gif',
    video_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    contributor_name: 'James Wilson',
    message: 'To an incredible year ahead! You have accomplished so much and I cannot wait to see what you do next!',
    photo_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',
    video_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    contributor_name: 'Rachel Kim',
    message: 'Two beautiful moments from our adventures together! Happy birthday! 📸✨',
    photo_url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&auto=format&fit=crop&q=80',
    video_url: null,
    created_at: new Date().toISOString(),
    // Simulating multiple photos for demo
    multiple_photos: [
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&auto=format&fit=crop&q=80'
    ],
  },
  {
    id: 'demo-6',
    contributor_name: 'Tom Anderson',
    message: 'Happy birthday! Here is to another year of amazing memories! 🥳',
    photo_url: null,
    video_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-7',
    contributor_name: 'Lisa Martinez',
    message: 'Three perfect snapshots from our time together! Happy birthday! 🎊',
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
    id: 'demo-8',
    contributor_name: 'Marcus Chen',
    message: 'Recorded a special video message for your big day! Cannot wait to celebrate! 🎥',
    photo_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    created_at: new Date().toISOString(),
  },
]

const mockMemoryPop = {
  id: 'demo-memorypop',
  recipient_name: 'Emma',
  occasion: 'Birthday',
  story: 'A celebration of Emma 30th birthday',
  share_code: 'demo',
  cover_style: 'warm',
  tone: 'heartfelt',
  is_premium: true,
  celebration_date: new Date().toISOString(),
  cover_photo_url: null,
}

export function GalleryShowcaseSection({ isPremium }: GalleryShowcaseSectionProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-[#f9f6f1] via-[#fefdfb] to-[#f5f0e8]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-[#3a241e] mb-4">
            Experience the New Design
          </h2>
          <p className="text-lg text-[#856b5f] max-w-2xl mx-auto mb-6">
            {isPremium
              ? 'Premium Glass Morphism design with support for photos, videos, GIFs, and multiple photos per memory'
              : 'Elegant memory wall with premium design (toggle Premium above to see the full experience)'}
          </p>

          {/* Feature Highlights */}
          <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">🪟</div>
                <p className="font-semibold text-[#3a241e]">Glass Effect</p>
                <p className="text-[#856b5f] text-xs mt-1">Frosted backdrop blur</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📸</div>
                <p className="font-semibold text-[#3a241e]">Multi-Photo</p>
                <p className="text-[#856b5f] text-xs mt-1">2-4 photos, smart layouts</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎥</div>
                <p className="font-semibold text-[#3a241e]">Videos</p>
                <p className="text-[#856b5f] text-xs mt-1">Full-screen player</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎉</div>
                <p className="font-semibold text-[#3a241e]">GIFs</p>
                <p className="text-[#856b5f] text-xs mt-1">Animated celebrations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Gallery Demo */}
        <div className="relative">
          {/* Optional overlay for non-premium */}
          {!isPremium && (
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-white/50 to-white/80 pointer-events-none" />
          )}

          <GalleryView
            memoryPop={mockMemoryPop}
            memories={demoMemories}
            shareLink="https://memorypop.app/demo"
          />
        </div>

        {/* Details Toggle */}
        <div className="text-center mt-12">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3a241e] text-white rounded-full
                       hover:bg-[#4a3428] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {showDetails ? 'Hide' : 'Show'} Technical Details
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDetails && (
            <div className="mt-8 max-w-3xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-serif text-[#3a241e] mb-4">What Makes This Special</h3>

              <div className="space-y-4 text-[#856b5f]">
                <div>
                  <p className="font-semibold text-[#3a241e] mb-1">🎨 Glass Morphism Design</p>
                  <p className="text-sm">iOS 15+ inspired frosted glass cards with multi-layer shadows and spring animations</p>
                </div>

                <div>
                  <p className="font-semibold text-[#3a241e] mb-1">📖 Smart Multi-Photo Layouts</p>
                  <p className="text-sm">2 photos: Book-style side-by-side • 3 photos: Magazine layout • 4 photos: Perfect grid • 5+ photos: Auto-rotate every 3s</p>
                </div>

                <div>
                  <p className="font-semibold text-[#3a241e] mb-1">📱 Mobile Optimized</p>
                  <p className="text-sm">Single column layout, touch-friendly interactions, all features work beautifully on mobile</p>
                </div>

                <div>
                  <p className="font-semibold text-[#3a241e] mb-1">🎬 Rich Media Support</p>
                  <p className="text-sm">Photos, animated GIFs, videos with player controls, and text-only memories</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
