export default function BirthdayPhotoGridMockup() {
  const photos = [
    { emoji: '🎂', label: 'Birthday cake' },
    { emoji: '🎈', label: 'Party balloons' },
    { emoji: '🎁', label: 'Gifts' },
    { emoji: '🥳', label: 'Celebration' },
    { emoji: '🎊', label: 'Confetti' },
    { emoji: '🍰', label: 'Desserts' },
  ];

  return (
    <div
      className="relative w-full overflow-hidden bg-[#FFF8F2]"
      style={{
        aspectRatio: '4/5',
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
    >
      <div className="absolute inset-0 flex flex-col p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#2B1E18] mb-2">
            Birthday Memories
          </h2>
          <p className="text-lg text-[#6B5B52]">
            86 photos from friends and family
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden bg-gradient-to-br from-[#FFE5D9] to-[#FFD1BA] flex flex-col items-center justify-center"
            >
              <div className="text-5xl mb-2">{photo.emoji}</div>
              <div className="text-sm text-[#6B5B52]">{photo.label}</div>
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="mt-6 text-center">
          <button className="text-[#FF6B57] font-semibold text-lg">
            View all 86 photos →
          </button>
        </div>
      </div>
    </div>
  );
}
