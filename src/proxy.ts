import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CANONICAL_HOST = 'www.memorypop.app';

/**
 * Consolidate all apex-domain requests onto the single public hostname used by
 * metadata, sitemaps, and internal links. Keeping this at the edge preserves
 * every path and query string while returning a permanent redirect.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();

  if (host === 'memorypop.app') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}
