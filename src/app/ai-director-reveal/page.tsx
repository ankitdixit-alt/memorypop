import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import RevealPreview from './RevealPreview'
import { isLocalPreview } from './previewGuard'

export default async function Page() {
  if (!isLocalPreview(process.env.NODE_ENV, (await headers()).get('host'))) notFound()
  return <RevealPreview />
}
