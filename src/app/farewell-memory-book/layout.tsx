/**
 * Farewell Memory Book Layout
 *
 * SEO metadata for farewell landing page.
 * Part of Phase 2C: Landing Pages
 */

import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Farewell Memory Book | Send-Off Gifts for Friends & Colleagues',
  description: 'Create a heartfelt farewell memory book by collecting messages, photos, and well-wishes. Perfect for coworkers, friends, or loved ones moving on to new adventures.',
  alternates: {
    canonical: getCanonicalUrl('/farewell-memory-book'),
  },
  openGraph: {
    title: 'Farewell Memory Book | Send-Off Gifts for Friends & Colleagues | MemoryPop',
    description: 'Create a heartfelt farewell memory book by collecting messages, photos, and well-wishes. Perfect for coworkers, friends, or loved ones moving on to new adventures.',
    url: getCanonicalUrl('/farewell-memory-book'),
  },
};

export default function FarewellMemoryBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
