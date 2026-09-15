/**
 * AI Director Reveal Layout - Development Only
 *
 * Runtime guard: Returns 404 if NODE_ENV !== 'development'
 */

import { notFound } from 'next/navigation'

export default function AIDirectorRevealLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // CRITICAL: Runtime guard for production environment
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return <>{children}</>
}
