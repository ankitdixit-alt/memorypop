import { NextResponse } from "next/server";

/**
 * robots.txt configuration
 * Provides crawler guidance and sitemap reference
 *
 * SEO Foundation Phase 1 - Task 2
 * Priority: P0 (Critical for crawler control)
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.com';

  const robotsTxt = `# MemoryPop Robots.txt
# Last Updated: ${new Date().toISOString().split('T')[0]}

# Allow all crawlers for public pages
User-agent: *
Allow: /
Allow: /create
Allow: /plus
Allow: /m/

# Disallow private pages
Disallow: /dashboard/
Disallow: /m/*/contribute
Disallow: /m/*/reveal
Disallow: /success
Disallow: /api/

# Disallow search result pages (if added in future)
Disallow: /search

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400', // Cache for 24 hours
    },
  });
}
