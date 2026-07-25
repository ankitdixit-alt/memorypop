export default function FarewellMemoryCollectionMockup() {
  const memories = [
    { emoji: '☕', label: 'Morning coffee talks', author: 'Sarah' },
    { emoji: '🎯', label: 'Project launch wins', author: 'David' },
    { emoji: '😂', label: 'Team lunch laughs', author: 'Emma' },
    { emoji: '💡', label: 'Brainstorming sessions', author: 'James' },
    { emoji: '🎤', label: 'Karaoke night', author: 'Lisa' },
    { emoji: '🏆', label: 'Award ceremony', author: 'Team' },
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
            Shared Moments
          </h2>
          <p className="text-lg text-[#6B5B52]">
            58 memories from friends and colleagues
          </p>
        </div>

        {/* Memory Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          {memories.map((memory, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden bg-white p-4 shadow-sm flex flex-col items-center justify-center text-center"
            >
              <div className="text-5xl mb-2">{memory.emoji}</div>
              <div className="text-sm font-semibold text-[#2B1E18] mb-1">
                {memory.label}
              </div>
              <div className="text-xs text-[#6B5B52]">
                from {memory.author}
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="mt-6 text-center">
          <button className="text-[#FF6B57] font-semibold text-lg">
            View all 58 memories →
          </button>
        </div>
      </div>
    </div>
  );
}
