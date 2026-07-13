import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // DSN from environment variable
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment (auto-detects from NODE_ENV)
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

  // Enable tracing (performance monitoring)
  // Set to 0.1 (10%) to avoid free tier limits
  tracesSampleRate: 0.1,

  // Capture all console errors in production
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Session replay sample rate
  // Only record 10% of sessions (to stay within free tier)
  replaysSessionSampleRate: 0.1,

  // Replay all sessions with errors
  replaysOnErrorSampleRate: 1.0,

  // Enable when DSN exists (not just in production NODE_ENV)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ignore common noise
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Random network errors
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

});

// Export navigation hook for Sentry router instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
