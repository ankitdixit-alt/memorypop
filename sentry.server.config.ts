import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // DSN from environment variable
  dsn: process.env.SENTRY_DSN,

  // Environment (auto-detects from NODE_ENV)
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

  // Enable tracing (performance monitoring)
  // Set to 0.1 (10%) to avoid free tier limits
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Integrations for server-side monitoring
  integrations: [
    Sentry.httpIntegration(),
  ],

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Attach server context
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Sentry server event (dev only):', event);
      return null;
    }
    return event;
  },
});
