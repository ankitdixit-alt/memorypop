/**
 * Birthday Memory Book Layout
 *
 * SEO metadata for birthday landing page.
 * Part of Phase 2C: Landing Pages
 */

import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Birthday Memory Book | Create Beautiful Birthday Keepsakes',
  description: 'Create a meaningful birthday memory book by collecting photos, messages, and memories from loved ones. Simple, thoughtful, unforgettable.',
  alternates: {
    canonical: getCanonicalUrl('/birthday-memory-book'),
  },
  openGraph: {
    title: 'Birthday Memory Book | Create Beautiful Birthday Keepsakes | MemoryPop',
    description: 'Create a meaningful birthday memory book by collecting photos, messages, and memories from loved ones. Simple, thoughtful, unforgettable.',
    url: getCanonicalUrl('/birthday-memory-book'),
  },
};

export default function BirthdayMemoryBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
