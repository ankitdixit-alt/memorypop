import * as Sentry from '@sentry/nextjs';

// Debug logging for initialization
console.log('[Sentry Edge] Initializing...', {
  hasDSN: !!process.env.SENTRY_DSN,
  dsnPrefix: process.env.SENTRY_DSN?.substring(0, 20) + '...',
  nodeEnv: process.env.NODE_ENV,
  sentryEnv: process.env.SENTRY_ENVIRONMENT,
});

Sentry.init({
  // DSN from environment variable
  dsn: process.env.SENTRY_DSN,

  // Environment (auto-detects from NODE_ENV)
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

  // Enable tracing (performance monitoring)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable when DSN exists (not just in production NODE_ENV)
  enabled: !!process.env.SENTRY_DSN,

  // Attach edge context
  beforeSend(event) {
    console.log('[Sentry Edge] Sending event:', {
      message: event.message,
      level: event.level,
      environment: event.environment,
    });
    return event;
  },
});
