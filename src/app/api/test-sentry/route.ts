import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  const error = new Error('Server-side test error for Sentry');

  Sentry.captureException(error);

  // Flush to ensure the event is sent before returning
  await Sentry.flush(2000);

  throw error;
}
