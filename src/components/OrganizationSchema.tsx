/**
 * Organization Schema Component
 *
 * Adds JSON-LD structured data for MemoryPop organization.
 * This helps search engines understand the business and display
 * rich snippets with brand information.
 *
 * SEO Foundation Quick Win #2
 */

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MemoryPop",
    "url": "https://memorypop.app",
    "logo": "https://memorypop.app/apple-touch-icon.png",
    "description": "Create one beautiful home for every celebration. MemoryPop brings friends and family together to share memories, photos, and heartfelt messages for birthdays, weddings, farewells, and more.",
    "foundingDate": "2026",
    "sameAs": [
      // Add social media URLs when available
      // "https://facebook.com/memorypop",
      // "https://instagram.com/memorypop",
      // "https://twitter.com/memorypop"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@memorypop.app",
      "availableLanguage": ["English"]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
