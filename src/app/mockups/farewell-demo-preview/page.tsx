export default function FarewellDemoPreviewMockup() {
  return (
    <div
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#D4E8F5] to-[#B8D9F0]"
      style={{
        aspectRatio: '16/9',
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-12">
        {/* Browser Frame */}
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Browser Chrome */}
          <div className="bg-[#F3E6D8] px-4 py-3 flex items-center gap-2 border-b border-[#EAD8C9]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF6B57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFD1BA]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFE5D9]"></div>
            </div>
            <div className="flex-1 ml-4 bg-white rounded px-3 py-1 text-sm text-[#6B5B52]">
              memorypop.app/m/farewell789
            </div>
          </div>

          {/* MemoryPop Content */}
          <div className="bg-[#FFF8F2] p-8">
            {/* Mini Navbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F0DED2]">
              <div className="text-xl font-bold text-[#2B1E18]">
                Memory<span className="text-[#FF6B57]">Pop</span>
              </div>
            </div>

            {/* Hero Section */}
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h1 className="text-3xl font-bold text-[#2B1E18] mb-3">
                We'll Miss You, Alex
              </h1>
              <p className="text-base text-[#6B5B52] mb-4">
                "Thank you for three amazing years together"
              </p>
              <button className="bg-[#FF6B57] text-white px-6 py-3 rounded-full font-semibold text-sm">
                ✨ Add Your Farewell Message
              </button>
            </div>

            {/* Memory Preview */}
            <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#F3E6D8]"></div>
                <div>
                  <p className="font-semibold text-[#2B1E18] text-sm">Michael T.</p>
                  <p className="text-xs text-[#6B5B52]">Nov 8, 2024</p>
                </div>
              </div>
              <p className="text-sm text-[#4A372F] leading-relaxed">
                Working with you these past three years has been amazing. You brought so much energy and creativity...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
