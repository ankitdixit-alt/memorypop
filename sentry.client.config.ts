import * as Sentry from '@sentry/nextjs';

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

  // Ignore development errors
  enabled: process.env.NODE_ENV === 'production',

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
    // Don't send events in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Sentry event (dev only):', event);
      return null;
    }
    return event;
  },
});
