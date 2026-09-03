import type { Metadata } from "next";

/**
 * SEO Foundation Phase 1 - Task 3
 * Plus page metadata with canonical URL and enhanced SEO
 */
export const metadata: Metadata = {
  title: 'MemoryPop Plus - Coming Soon',
  description: 'MemoryPop Plus: More room for every memory. 10 photos, 3 GIFs, 90-sec video per contributor, plus custom music and premium reveal styles. Founding price €4.99.',
  alternates: {
    canonical: '/plus',
  },
  openGraph: {
    title: 'MemoryPop Plus - Coming Soon',
    description: 'MemoryPop Plus: More room for every memory. 10 photos, 3 GIFs, 90-sec video per contributor, plus custom music and premium reveal styles.',
    type: 'website',
    url: '/plus',
    images: [
      {
        url: '/og/default.png',
        width: 1200,
        height: 630,
        alt: 'MemoryPop Plus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemoryPop Plus - Coming Soon',
    description: 'MemoryPop Plus: More room for every memory. 10 photos, 3 GIFs, 90-sec video per contributor, plus custom music and premium reveal styles.',
    images: ['/og/default.png'],
  },
};

export default function PlusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
