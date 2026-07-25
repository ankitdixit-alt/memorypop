/**
 * Event Schema Component
 *
 * Generates Event structured data (schema.org) for landing pages.
 * Helps search engines understand the purpose and context of occasion-specific pages.
 *
 * Part of Phase 2C: SEO Foundation
 */

'use client';

interface EventSchemaProps {
  /** Display name of the occasion (e.g., "Birthday", "Retirement", "Farewell") */
  occasion: string;
  /** URL slug for the occasion (e.g., "birthday-memory-book") */
  occasionSlug: string;
}

/**
 * Event Schema component for landing pages
 *
 * Generates structured data for search engines to understand the page content
 * and purpose. Used on occasion-specific landing pages.
 *
 * @param occasion - Display name (e.g., "Birthday")
 * @param occasionSlug - URL slug (e.g., "birthday-memory-book")
 */
export function EventSchema({ occasion, occasionSlug }: EventSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.app';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${occasion} Memory Book Creation`,
    description: `Create a meaningful ${occasion.toLowerCase()} memory book by collecting photos, messages, and memories from friends and family. Simple, thoughtful, unforgettable.`,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'VirtualLocation',
      url: `${baseUrl}/${occasionSlug}`,
    },
    organizer: {
      '@type': 'Organization',
      name: 'MemoryPop',
      url: baseUrl,
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/create?occasion=${occasion.toLowerCase()}`,
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
