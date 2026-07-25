/**
 * SEO Utilities
 *
 * Canonical URL generation and site configuration for SEO optimization.
 * Part of Phase 2C: SEO Foundation
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.app';

/**
 * Site-wide configuration for SEO and schema markup
 */
export const SITE_CONFIG = {
  name: 'MemoryPop',
  url: BASE_URL,
  description: 'Create beautiful online memory books for every celebration',
  organization: {
    name: 'MemoryPop',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
  },
} as const;

/**
 * Generate canonical URL for a given path
 *
 * @param path - Page path (e.g., '/' or '/about' or 'birthday-memory-book')
 * @returns Fully qualified canonical URL
 *
 * @example
 * getCanonicalUrl('/') // 'https://memorypop.app/'
 * getCanonicalUrl('/about') // 'https://memorypop.app/about'
 * getCanonicalUrl('birthday-memory-book') // 'https://memorypop.app/birthday-memory-book'
 */
export function getCanonicalUrl(path: string): string {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Remove trailing slash unless it's the root path
  const normalizedPath = cleanPath === '/' ? cleanPath : cleanPath.replace(/\/$/, '');

  return `${BASE_URL}${normalizedPath}`;
}
