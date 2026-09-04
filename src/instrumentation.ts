import { validateServerEnvironment } from './lib/serverEnv';

export async function register() {
  // Fail closed before the server accepts requests if auth or service secrets
  // are absent. The validator never exposes secret values in its error.
  validateServerEnvironment();

  // Only run on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  // Only run on edge
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
