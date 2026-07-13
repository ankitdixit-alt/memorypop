import { NextResponse } from 'next/server';

export async function GET() {
  throw new Error('Server-side test error for Sentry');
  return NextResponse.json({ error: 'This should not be reached' });
}
