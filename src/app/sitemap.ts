/**
 * Dynamic Sitemap Generation
 *
 * Generates sitemap.xml for search engine crawlers with all public pages.
 * Includes proper priorities and change frequencies for optimal crawling.
 *
 * Part of Phase 2C: SEO Foundation
 */

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.app';
  const currentDate = new Date();

  // Define all public routes with SEO metadata
  const routes = [
    // High-priority pages
    {
      url: '',
      priority: 1.0,
      changeFrequency: 'weekly' as const,
    },
    {
      url: '/occasions',
      priority: 0.9,
      changeFrequency: 'monthly' as const,
    },

    // Landing pages (high-priority for organic acquisition)
    {
      url: '/birthday-memory-book',
      priority: 0.9,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/retirement-memory-book',
      priority: 0.9,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/farewell-memory-book',
      priority: 0.9,
      changeFrequency: 'monthly' as const,
    },

    // Product pages
    {
      url: '/how-it-works',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/pricing',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/create',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/demo',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },

    // Support pages
    {
      url: '/help-center',
      priority: 0.7,
      changeFrequency: 'weekly' as const,
    },
    {
      url: '/contact',
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    },

    // Company pages
    {
      url: '/about',
      priority: 0.5,
      changeFrequency: 'yearly' as const,
    },
    {
      url: '/press',
      priority: 0.4,
      changeFrequency: 'yearly' as const,
    },
    {
      url: '/careers',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
    },

    // Legal pages
    {
      url: '/privacy',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
    },
    {
      url: '/terms',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
    },

    // Status page (low priority, frequent updates)
    {
      url: '/status',
      priority: 0.3,
      changeFrequency: 'daily' as const,
    },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
