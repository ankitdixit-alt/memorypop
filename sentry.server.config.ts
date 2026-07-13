import * as Sentry from '@sentry/nextjs';

// Debug logging for initialization
console.log('[Sentry Server] Initializing...', {
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
  // Set to 0.1 (10%) to avoid free tier limits
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Integrations for server-side monitoring
  integrations: [
    Sentry.httpIntegration(),
  ],

  // Enable when DSN exists (not just in production NODE_ENV)
  enabled: !!process.env.SENTRY_DSN,

  // Attach server context
  beforeSend(event) {
    console.log('[Sentry Server] Sending event:', {
      message: event.message,
      level: event.level,
      environment: event.environment,
    });
    return event;
  },
});
