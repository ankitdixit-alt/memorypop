import type { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Experience a MemoryPop - See How It Works',
  description:
    'See how 42 people created an unforgettable birthday celebration for Emma. Explore messages, photos, and the emotional impact of bringing people together in one beautiful memory book.',
  openGraph: {
    title: 'Experience a MemoryPop - See How It Works',
    description:
      'See how 42 people created an unforgettable birthday celebration for Emma. Explore messages, photos, and the emotional impact of bringing people together in one beautiful memory book.',
    url: getCanonicalUrl('/demo'),
    type: 'website',
    images: [
      {
        url: '/og-demo.jpg', // Future: Create OG image
        width: 1200,
        height: 630,
        alt: 'Experience a MemoryPop Demo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Experience a MemoryPop - See How It Works',
    description:
      'See how 42 people created an unforgettable birthday celebration for Emma.',
    images: ['/og-demo.jpg'],
  },
  alternates: {
    canonical: getCanonicalUrl('/demo'),
  },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Schema.org Product Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'MemoryPop',
            description:
              'Create beautiful online memory books for birthdays, retirements, farewells, and other celebrations',
            brand: {
              '@type': 'Brand',
              name: 'MemoryPop',
            },
            offers: {
              '@type': 'Offer',
              availability: 'https://schema.org/InStock',
              priceCurrency: 'USD',
              price: '0',
              priceValidUntil: '2026-12-31',
              url: 'https://memorypop.app/create',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '5.0',
              reviewCount: '42',
            },
          }),
        }}
      />
      {children}
    </>
  )
}
