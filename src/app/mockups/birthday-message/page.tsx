export default function BirthdayMessageMockup() {
  return (
    <div
      className="relative w-full overflow-hidden bg-white"
      style={{
        aspectRatio: '4/5',
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
    >
      <div className="absolute inset-0 flex flex-col p-8">
        {/* Photo */}
        <div className="w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFE5D9] to-[#FFD1BA] mb-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-2">🗼</div>
            <div className="text-sm text-[#6B5B52]">Paris memory photo</div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F3E6D8]"></div>
            <div>
              <p className="font-semibold text-[#2B1E18] text-lg">Emma K.</p>
              <p className="text-sm text-[#6B5B52]">Best friend since college</p>
            </div>
          </div>
          <p className="text-sm text-[#6B5B52]">Jun 15, 2024</p>
        </div>

        {/* Message */}
        <div className="flex-1 overflow-hidden">
          <p className="text-base leading-relaxed text-[#4A372F]">
            Remember that time we got lost in Paris and ended up at that tiny café at 2am? The owner made us hot chocolate and we talked until sunrise. That's my favorite memory of us—getting lost and finding magic.
          </p>
          <p className="text-base leading-relaxed text-[#4A372F] mt-4">
            You make every adventure better. Can't wait to see what the next 30 years bring. Love you, bestie! 💕
          </p>
        </div>
      </div>
    </div>
  );
}
