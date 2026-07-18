import type { Metadata } from "next";

/**
 * SEO Foundation Phase 1 - Task 3
 * Create page metadata with canonical URL and enhanced SEO
 */
export const metadata: Metadata = {
  title: 'Create a MemoryPop',
  description: 'Start creating a beautiful online memory book for birthdays, weddings, farewells, and celebrations. Gather memories, photos, and heartfelt messages from friends and family.',
  alternates: {
    canonical: '/create',
  },
  openGraph: {
    title: 'Create a MemoryPop - Beautiful Online Memory Books',
    description: 'Start creating a beautiful online memory book for birthdays, weddings, farewells, and celebrations.',
    type: 'website',
    url: '/create',
    images: [
      {
        url: '/og/default.png',
        width: 1200,
        height: 630,
        alt: 'Create a MemoryPop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create a MemoryPop - Beautiful Online Memory Books',
    description: 'Start creating a beautiful online memory book for birthdays, weddings, farewells, and celebrations.',
    images: ['/og/default.png'],
  },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
