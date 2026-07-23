import { supabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

/**
 * Dynamic sitemap.xml generator
 * Lists all public MemoryPop pages for search engine crawling
 *
 * SEO Foundation Phase 1 - Task 1
 * Priority: P0 (Critical for indexation)
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.app';

  try {
    // Query public MemoryPops from database
    const { data: memorypops, error } = await supabaseServer
      .from('memorypops')
      .select('share_code, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Sitemap generation error:', error);
      return new NextResponse('Error generating sitemap', { status: 500 });
    }

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Create Page -->
  <url>
    <loc>${baseUrl}/create</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Plus Page -->
  <url>
    <loc>${baseUrl}/plus</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Public MemoryPop Pages -->
${memorypops?.map((mp) => {
  const lastmod = mp.created_at || new Date().toISOString();
  return `  <url>
    <loc>${baseUrl}/m/${mp.share_code}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
