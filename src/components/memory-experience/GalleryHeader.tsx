"use client";

/**
 * Gallery Header
 *
 * Displays recipient name with premium typography
 * Responsive: 32px mobile → 40px desktop
 * Serif font for emotional resonance
 */

interface GalleryHeaderProps {
  recipientName: string;
}

export default function GalleryHeader({ recipientName }: GalleryHeaderProps) {
  return (
    <header className="text-center px-6 py-12 md:py-16">
      <h1 className="text-[32px] md:text-[40px] font-serif text-[#3a241e] leading-tight">
        Memories for {recipientName}
      </h1>
      <p className="mt-4 text-base md:text-lg text-[#856b5f]">
        A collection from those who care about you
      </p>
    </header>
  );
}
