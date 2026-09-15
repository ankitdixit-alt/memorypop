/**
 * AI Director Preview Layout
 *
 * RUNTIME GUARD: Returns 404 if NODE_ENV !== 'development'
 * This is a runtime check, not a build-time check.
 * The route will exist in production builds but will return 404.
 */

import { notFound } from 'next/navigation'

export default function AIDirectorPreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // CRITICAL: Runtime guard for production environment
  // This check happens at request time, not build time
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return <>{children}</>
}
