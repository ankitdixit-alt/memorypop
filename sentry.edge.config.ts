import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // DSN from environment variable
  dsn: process.env.SENTRY_DSN,

  // Environment (auto-detects from NODE_ENV)
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

  // Enable tracing (performance monitoring)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable when DSN exists (not just in production NODE_ENV)
  enabled: !!process.env.SENTRY_DSN,

});
