/**
 * Server environment validation.
 *
 * Keep secrets server-only: this module must never be imported by Client
 * Components. Validation is run during server startup and each security-
 * sensitive caller retrieves its secret through this module as a safeguard.
 */

type RequiredSecret =
  | 'SESSION_SECRET'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'VIDEO_VALIDATION_SECRET';

const REQUIRED_SECRETS: readonly RequiredSecret[] = [
  'SESSION_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VIDEO_VALIDATION_SECRET',
];

function isConfigured(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getMissingSecrets(env: NodeJS.ProcessEnv): string[] {
  const missing: string[] = REQUIRED_SECRETS.filter((name) => !isConfigured(env[name]));

  if (env.ENABLE_PREMIUM_BETA === 'true' && !isConfigured(env.STRIPE_SECRET_KEY)) {
    missing.push('STRIPE_SECRET_KEY');
  }

  if (env.CREATOR_EMAIL_ENABLED === 'true' && !isConfigured(env.RESEND_API_KEY)) {
    missing.push('RESEND_API_KEY');
  }

  return missing;
}

/**
 * Throws before the app accepts requests when a required server secret is not
 * configured. Feature-specific secrets are required only when the feature is
 * enabled.
 */
export function validateServerEnvironment(env: NodeJS.ProcessEnv = process.env): void {
  const missing = getMissingSecrets(env);

  if (missing.length > 0) {
    throw new Error(`Missing required server environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Returns a required server secret. This intentionally has no fallback value:
 * authentication must fail closed if deployment configuration is incomplete.
 */
export function getRequiredServerSecret(name: RequiredSecret): string {
  const value = process.env[name];

  if (!isConfigured(value)) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}
