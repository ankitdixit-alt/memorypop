"use client";

import Image from "next/image";

/**
 * Gallery Closing Component
 *
 * Appears at the bottom of the memory gallery:
 * - Lists all contributors (names + avatars if available)
 * - "Your permanent home" message with emotional resonance
 *
 * Visual language:
 * - Warm gradient background matching Premium Reveal
 * - Serif typography for emotional moment
 * - Generous padding and spacing
 * - Contributors displayed as elegant list or grid
 */

interface GalleryClosingProps {
  contributors: Array<{
    name: string;
    avatarUrl?: string;
  }>;
}

export default function GalleryClosing({ contributors }: GalleryClosingProps) {
  return (
    <section className="w-full px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center space-y-12">
        {/* Contributors list */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-[#3a241e] mb-8">
            With love from
          </h2>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {contributors.map((contributor, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-3"
              >
                {/* Avatar */}
                {contributor.avatarUrl ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#856b5f]/20">
                    <Image
                      src={contributor.avatarUrl}
                      alt={contributor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f9f6f1] to-[#f5f0e8]
                                  flex items-center justify-center ring-2 ring-[#856b5f]/20">
                    <span className="text-xl font-serif text-[#3a241e]">
                      {contributor.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Name */}
                <p className="text-sm md:text-base text-[#856b5f]">
                  {contributor.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Permanent home message */}
        <div className="pt-12 border-t border-[#856b5f]/20">
          <p className="text-lg md:text-xl font-serif text-[#3a241e] leading-relaxed">
            These memories are your permanent home.
          </p>
          <p className="mt-4 text-base md:text-lg text-[#856b5f]">
            Return here anytime to revisit the moments that matter.
          </p>
        </div>

        {/* Optional: Memory Pop branding */}
        <div className="pt-8">
          <p className="text-sm text-[#856b5f]/70 uppercase tracking-wider">
            Made with Memory Pop
          </p>
        </div>
      </div>
    </section>
  );
}
