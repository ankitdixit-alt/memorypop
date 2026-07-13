import * as Sentry from '@sentry/nextjs';

// Debug logging for initialization
console.log('[Sentry Client] Initializing from instrumentation-client.ts...', {
  hasDSN: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  dsnPrefix: process.env.NEXT_PUBLIC_SENTRY_DSN?.substring(0, 20) + '...',
  nodeEnv: process.env.NODE_ENV,
  sentryEnv: process.env.SENTRY_ENVIRONMENT,
});

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

  // Attach user context
  beforeSend(event) {
    console.log('[Sentry Client] Sending event:', {
      message: event.message,
      exception: event.exception?.values?.[0]?.value,
      level: event.level,
      environment: event.environment,
    });
    return event;
  },
});

console.log('[Sentry Client] Initialization complete');

// Export navigation hook for Sentry router instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
