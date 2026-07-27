import type { Demo } from '@/data/demos/emma-birthday'

interface CoverSectionProps {
  demo: Demo
  isPremium: boolean
}

export function CoverSection({ demo, isPremium }: CoverSectionProps) {
  const baseClasses = 'relative mx-auto max-w-2xl px-6 py-16 transition-all duration-500'
  const premiumClasses = isPremium ? 'transform' : ''

  return (
    <section className="relative min-h-[500px] py-12 bg-gradient-to-br from-orange-100/80 via-pink-50/70 to-purple-50/80">
      <div className={`${baseClasses} ${premiumClasses}`}>
        {/* Occasion Badge */}
        <div className="flex justify-center mb-6">
          {isPremium ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-900 shadow-lg shadow-orange-200/50">
              <span className="text-base">✨</span>
              Premium
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white text-orange-700 shadow-sm">
              <span className="text-base">🎂</span>
              Birthday MemoryPop
            </span>
          )}
        </div>

        {/* Main Headline */}
        <h2
          className={`text-center font-bold text-gray-900 mb-8 transition-all duration-500 ${
            isPremium
              ? 'text-[34px] md:text-[38px] tracking-tight leading-tight'
              : 'text-[28px] md:text-[32px] leading-tight'
          }`}
        >
          {demo.recipient.name} turns {demo.recipient.age}!
        </h2>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-center">
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-orange-600">
              {demo.stats.contributors}
            </span>
            <span className="text-sm text-gray-600">contributors</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-pink-600">
              {demo.stats.messages}
            </span>
            <span className="text-sm text-gray-600">messages</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-purple-600">
              {demo.stats.photos}
            </span>
            <span className="text-sm text-gray-600">photos</span>
          </div>
        </div>

        {/* Contributor Avatars */}
        <div className="flex justify-center">
          <div className="flex -space-x-3">
            {demo.messages.slice(0, 5).map((message, idx) => (
              <div
                key={message.id}
                className={`rounded-full bg-gradient-to-br from-orange-200 to-pink-200 border-2 transition-all duration-500 ${
                  isPremium ? 'w-12 h-12 border-4 border-yellow-200/70' : 'w-10 h-10 border-white'
                }`}
                style={{ zIndex: 5 - idx }}
                title={message.contributor.name}
              >
                {/* Placeholder for avatar - in production would use actual images */}
                <div className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {message.contributor.name[0]}
                </div>
              </div>
            ))}
            {demo.stats.contributors > 5 && (
              <div
                className={`rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 font-medium text-xs transition-all duration-300 ${
                  isPremium ? 'w-12 h-12' : 'w-10 h-10'
                }`}
                style={{ zIndex: 0 }}
              >
                +{demo.stats.contributors - 5}
              </div>
            )}
          </div>
        </div>

        {/* Premium Enhancement - Subtle Glow */}
        {isPremium && (
          <div className="absolute inset-0 -z-10 rounded-3xl shadow-2xl shadow-orange-300/40" />
        )}
      </div>
    </section>
  )
}
