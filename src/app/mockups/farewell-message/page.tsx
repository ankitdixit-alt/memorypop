export default function FarewellMessageMockup() {
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
              <p className="font-semibold text-[#2B1E18] text-lg">Michael T.</p>
              <p className="text-sm text-[#6B5B52]">Team Lead</p>
            </div>
          </div>
          <p className="text-sm text-[#6B5B52]">Nov 8, 2024</p>
        </div>

        {/* Message */}
        <div className="flex-1 overflow-hidden">
          <p className="text-base leading-relaxed text-[#4A372F]">
            Working with you these past three years has been amazing. You brought so much energy and creativity to every project. Remember that launch week when everything went wrong? Your calm optimism kept the whole team going.
          </p>
          <p className="text-base leading-relaxed text-[#4A372F] mt-4">
            I'm going to miss our coffee chats where we solved the world's problems (and occasionally some work problems too). You made coming to the office actually fun.
          </p>
          <p className="text-base leading-relaxed text-[#4A372F] mt-4">
            San Francisco is lucky to have you. Stay in touch, and come visit us whenever you're back in town. You'll always have a place here.
          </p>
          <p className="text-base leading-relaxed text-[#4A372F] mt-4 font-semibold">
            Good luck with everything! We're all rooting for you. 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
