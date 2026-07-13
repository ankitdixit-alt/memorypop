import * as Sentry from '@sentry/nextjs';

// Debug logging for initialization
console.log('[Sentry Client] Initializing...', {
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
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

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
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

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

  // Breadcrumbs for better debugging
  beforeBreadcrumb(breadcrumb) {
    // Don't log console breadcrumbs in dev
    if (breadcrumb.category === 'console' && process.env.NODE_ENV !== 'production') {
      return null;
    }
    return breadcrumb;
  },

  // Attach user context
  beforeSend(event) {
    console.log('[Sentry Client] Sending event:', {
      message: event.message,
      level: event.level,
      environment: event.environment,
    });
    return event;
  },
});
