import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { isLocalPreview } from '../../previewGuard'

// Local, read-only fixture server. No uploads, credentials, network fetches or arbitrary paths.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const MIME: Record<string, string> = { png: 'image/png', svg: 'image/svg+xml', gif: 'image/gif', mp4: 'video/mp4', wav: 'audio/wav' }
const allowed = new Set([
  ...Array.from({length:10}, (_,i) => 'photo-' + String(i+1).padStart(2,'0') + (i<4 ? '.png' : '.svg')),
  ...[1,2,3].flatMap(i => ['celebrate-' + i + '.gif', 'celebrate-' + i + '.png']),
  ...[8,10,12,15,18,22,90].map(n => 'sample-' + n + '.mp4'), 'ambient.wav',
])
export async function GET(request: Request, context: { params: Promise<{asset: string}> }) {
  if (!isLocalPreview(process.env.NODE_ENV, request.headers.get('host'))) return new Response(null, {status:404})
  const {asset} = await context.params
  if (!allowed.has(asset)) return new Response(null, {status:404})
  let bytes: Buffer
  try { bytes = await readFile(join(process.cwd(), 'scripts/fixtures/reveal-media', asset)) }
  catch { return new Response(null, {status:404}) }
  const headers = new Headers({
    'Content-Type': MIME[asset.split('.').pop()!],
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  })
  const range = request.headers.get('range')
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (!match || (!match[1] && !match[2])) return new Response(null, {status:416, headers:{'Content-Range':'bytes */' + bytes.length}})
    const start = match[1] ? Number(match[1]) : Math.max(0, bytes.length - Number(match[2]))
    const end = match[1] ? Math.min(match[2] ? Number(match[2]) : bytes.length - 1, bytes.length - 1) : bytes.length - 1
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= bytes.length)
      return new Response(null, {status:416, headers:{'Content-Range':'bytes */' + bytes.length}})
    headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + bytes.length)
    headers.set('Content-Length', String(end - start + 1))
    return new Response(new Uint8Array(bytes.subarray(start, end + 1)), {status:206, headers})
  }
  headers.set('Content-Length', String(bytes.length))
  return new Response(new Uint8Array(bytes), {headers})
}

