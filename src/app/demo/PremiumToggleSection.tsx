interface PremiumToggleSectionProps {
  isPremium: boolean
  onToggle: (isPremium: boolean) => void
}

export function PremiumToggleSection({ isPremium, onToggle }: PremiumToggleSectionProps) {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-3xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          See the same celebration, elevated
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Toggle to see how Premium transforms the presentation
        </p>

        {/* Toggle Control */}
        <div className="inline-flex items-center gap-4 p-2 bg-white rounded-full shadow-lg mb-8">
          <button
            onClick={() => onToggle(false)}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              !isPremium
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => onToggle(true)}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              isPremium
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            ✨ Premium
          </button>
        </div>

        {/* Description */}
        <div className="max-w-2xl mx-auto">
          {isPremium ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50/50 to-pink-50/50 border border-orange-100/60">
              <p className="text-base text-gray-700 leading-relaxed">
                Enhanced typography, elegant spacing, and keepsake-quality presentation
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <p className="text-base text-gray-700 leading-relaxed">
                Beautiful and complete—perfect for sharing heartfelt memories
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
