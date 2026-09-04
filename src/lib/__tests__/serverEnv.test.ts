import { getRequiredServerSecret, validateServerEnvironment } from '@/lib/serverEnv';

const validEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: 'test',
  SESSION_SECRET: 'test-session-secret',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  VIDEO_VALIDATION_SECRET: 'test-video-validation-secret',
};

describe('server environment validation', () => {
  const originalEnvironment = process.env;

  afterEach(() => {
    process.env = originalEnvironment;
  });

  it('accepts the required core server secrets', () => {
    expect(() => validateServerEnvironment(validEnvironment)).not.toThrow();
  });

  it('rejects an absent session secret', () => {
    const environment = { ...validEnvironment };
    delete environment.SESSION_SECRET;

    expect(() => validateServerEnvironment(environment)).toThrow('SESSION_SECRET');
  });

  it('rejects a blank session secret', () => {
    expect(() => validateServerEnvironment({ ...validEnvironment, SESSION_SECRET: '   ' })).toThrow(
      'SESSION_SECRET'
    );
  });

  it('requires Stripe only when premium beta is enabled', () => {
    expect(() => validateServerEnvironment({ ...validEnvironment, ENABLE_PREMIUM_BETA: 'true' })).toThrow(
      'STRIPE_SECRET_KEY'
    );
  });

  it('requires Resend only when creator email is enabled', () => {
    expect(() => validateServerEnvironment({ ...validEnvironment, CREATOR_EMAIL_ENABLED: 'true' })).toThrow(
      'RESEND_API_KEY'
    );
  });

  it('never falls back to a default session secret', () => {
    process.env = { ...validEnvironment };
    delete process.env.SESSION_SECRET;

    expect(() => getRequiredServerSecret('SESSION_SECRET')).toThrow('SESSION_SECRET');
  });
});
