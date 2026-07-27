import { useState, useEffect } from 'react'
import type { DemoMessage } from '@/data/demos/emma-birthday'

interface MessagesSectionProps {
  messages: DemoMessage[]
  isPremium: boolean
  onExpand: () => void
}

export function MessagesSection({ messages, isPremium, onExpand }: MessagesSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const featuredMessages = messages.filter(m => m.featured)
  const previewMessages = messages.filter(m => !m.featured)

  const handleExpand = () => {
    setExpanded(true)
    onExpand()
  }

  // Trigger stagger animation on scroll
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

    const section = document.getElementById('messages-section')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="messages-section" className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Featured Messages (Full Display) */}
        {featuredMessages.map((message, idx) => (
          <MessageCard
            key={message.id}
            message={message}
            isPremium={isPremium}
            delay={idx * 150}
            isVisible={isVisible}
          />
        ))}

        {/* Preview Messages */}
        {previewMessages.map((message, idx) => (
          <MessageCard
            key={message.id}
            message={message}
            isPremium={isPremium}
            isPreview={!expanded}
            delay={(featuredMessages.length + idx) * 150}
            isVisible={isVisible}
          />
        ))}

        {/* See More Button */}
        {!expanded && previewMessages.length > 0 && (
          <div className="text-center pt-4">
            <button
              onClick={handleExpand}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
            >
              See {messages.length - featuredMessages.length} more memories
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

interface MessageCardProps {
  message: DemoMessage
  isPremium: boolean
  isPreview?: boolean
  delay: number
  isVisible: boolean
}

function MessageCard({ message, isPremium, isPreview = false, delay, isVisible }: MessageCardProps) {
  const baseClasses =
    'relative rounded-2xl transition-all duration-400 bg-white border border-gray-100'
  const premiumClasses = isPremium
    ? 'p-8 shadow-xl bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 border-orange-100/50'
    : 'p-6 shadow-md'

  // Extract preview (first 2 lines)
  const previewContent = message.content.split('\n').slice(0, 2).join('\n') + '...'
  const displayContent = isPreview ? previewContent : message.content

  return (
    <article
      className={`${baseClasses} ${premiumClasses} transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Header */}
      <header className="flex items-center gap-4 mb-4">
        <div
          className={`rounded-full bg-gradient-to-br from-orange-200 to-pink-200 flex-shrink-0 transition-all duration-300 ${
            isPremium ? 'w-[52px] h-[52px] ring-2 ring-orange-200' : 'w-10 h-10'
          }`}
        >
          <div className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold">
            {message.contributor.name[0]}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{message.contributor.name}</h3>
          <p className="text-sm text-gray-500">{message.contributor.relationship}</p>
        </div>
        <time className="text-sm text-gray-400">{message.timestamp}</time>
      </header>

      {/* Message Content */}
      <div
        className={`text-gray-700 whitespace-pre-wrap transition-all duration-400 ${
          isPremium
            ? 'text-lg leading-[1.75] tracking-[0.02em]'
            : 'text-base leading-normal'
        }`}
      >
        {displayContent}
      </div>

      {/* Premium Decorative Element - Subtle Quote */}
      {isPremium && !isPreview && (
        <div className="absolute top-6 right-6 text-orange-200 opacity-30 text-5xl font-serif leading-none">
          &ldquo;
        </div>
      )}
    </article>
  )
}
