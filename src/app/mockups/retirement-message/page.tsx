export default function RetirementMessageMockup() {
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F3E6D8]"></div>
            <div>
              <p className="font-semibold text-[#2B1E18] text-lg">Jennifer S.</p>
              <p className="text-sm text-[#6B5B52]">Director of Operations</p>
            </div>
          </div>
          <p className="text-sm text-[#6B5B52]">Dec 20, 2024</p>
        </div>

        {/* Message */}
        <div className="flex-1 overflow-hidden">
          <p className="text-base leading-relaxed text-[#4A372F]">
            Your leadership shaped not just our projects, but our careers. You taught us to lead with empathy, to make decisions with integrity, and to always put people first.
          </p>
          <p className="text-base leading-relaxed text-[#4A372F] mt-4">
            I still remember my first week when you sat down with me for two hours, just to make sure I felt welcome and understood our mission. That's who you are—someone who makes everyone feel valued.
          </p>
          <p className="text-base leading-relaxed text-[#4A372F] mt-4">
            From late nights before big launches to celebrating wins as a team, you made work feel less like work and more like being part of something meaningful.
          </p>
          <p className="text-base leading-relaxed text-[#4A372F] mt-4 font-semibold">
            Thank you for 12 years of mentorship, patience, and inspiration. Enjoy every moment of this next chapter—you've earned it! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
