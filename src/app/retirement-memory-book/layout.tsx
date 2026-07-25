/**
 * Retirement Memory Book Layout
 *
 * SEO metadata for retirement landing page.
 * Part of Phase 2C: Landing Pages
 */

import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Retirement Memory Book | Celebrate Careers with Meaningful Keepsakes',
  description: 'Create a thoughtful retirement memory book by collecting messages, photos, and memories from colleagues. Honor their career and celebrate their next chapter.',
  alternates: {
    canonical: getCanonicalUrl('/retirement-memory-book'),
  },
  openGraph: {
    title: 'Retirement Memory Book | Celebrate Careers with Meaningful Keepsakes | MemoryPop',
    description: 'Create a thoughtful retirement memory book by collecting messages, photos, and memories from colleagues. Honor their career and celebrate their next chapter.',
    url: getCanonicalUrl('/retirement-memory-book'),
  },
};

export default function RetirementMemoryBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
