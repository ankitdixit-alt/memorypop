import type { Metadata } from "next";

/**
 * SEO Foundation Phase 1 - Task 3
 * Plus page metadata with canonical URL and enhanced SEO
 */
export const metadata: Metadata = {
  title: 'MemoryPop Plus - Unlimited Photos & Premium Features',
  description: 'Upgrade your celebration with MemoryPop Plus. Get unlimited photos, priority support, and exclusive features. One-time payment per celebration.',
  alternates: {
    canonical: '/plus',
  },
  openGraph: {
    title: 'MemoryPop Plus - Unlimited Photos & Premium Features',
    description: 'Upgrade your celebration with MemoryPop Plus. Get unlimited photos, priority support, and exclusive features.',
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
    title: 'MemoryPop Plus - Unlimited Photos & Premium Features',
    description: 'Upgrade your celebration with MemoryPop Plus. Get unlimited photos, priority support, and exclusive features.',
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
