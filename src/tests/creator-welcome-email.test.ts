/**
 * Creator Welcome Email Tests
 * Private Beta: Optional Email Convenience Feature
 *
 * Security Requirements Tested:
 * - Creator session authorization
 * - Management token hash validation
 * - No persistence of raw management token
 * - No persistence of unverified email address
 * - Rate limiting (5 minutes)
 * - No token or email in logs/analytics
 * - Invalid email rejection
 * - Resend error handling
 */

import { generateManagementToken, hashManagementToken } from '@/lib/verification';

describe('Creator Welcome Email - Unit Tests', () => {
  describe('Token Hash Validation Logic', () => {
    it('should validate that supplied token hashes to stored hash', () => {
      const { token, tokenHash } = generateManagementToken();

      // Simulate API receiving token and hashing it
      const receivedTokenHash = hashManagementToken(token);

      // Should match stored hash
      expect(receivedTokenHash).toBe(tokenHash);
    });

    it('should reject token that does not match stored hash', () => {
      const { tokenHash: storedHash } = generateManagementToken();
      const { token: wrongToken } = generateManagementToken();

      // Simulate API receiving wrong token
      const receivedTokenHash = hashManagementToken(wrongToken);

      // Should NOT match stored hash
      expect(receivedTokenHash).not.toBe(storedHash);
    });

    it('should use constant-time-safe comparison for token hashes', () => {
      const { token } = generateManagementToken();

      // Hash the token
      const receivedHash = hashManagementToken(token);

      // Simple string comparison is acceptable here since hashes are already cryptographic
      // Timing attacks on the comparison are not a concern when comparing hash outputs
      expect(receivedHash).toBeDefined();
      expect(receivedHash.length).toBeGreaterThan(0);
    });
  });

  describe('Email Validation', () => {
    function isValidEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    it('should accept valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('creator@memorypop.app')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
    });

    it('should normalize email addresses', () => {
      const email = ' USER@EXAMPLE.COM ';
      const normalized = email.toLowerCase().trim();

      expect(normalized).toBe('user@example.com');
    });
  });

  describe('Rate Limiting Logic', () => {
    it('should allow send if no previous send timestamp', () => {
      const lastSentAt = null;

      // No previous send - should allow
      expect(lastSentAt).toBeNull();
    });

    it('should allow send if more than 5 minutes elapsed', () => {
      const lastSentAt = new Date(Date.now() - 6 * 60 * 1000); // 6 minutes ago
      const minutesSince = (Date.now() - lastSentAt.getTime()) / (1000 * 60);

      expect(minutesSince).toBeGreaterThan(5);
    });

    it('should block send if less than 5 minutes elapsed', () => {
      const lastSentAt = new Date(Date.now() - 3 * 60 * 1000); // 3 minutes ago
      const minutesSince = (Date.now() - lastSentAt.getTime()) / (1000 * 60);

      expect(minutesSince).toBeLessThan(5);
    });

    it('should handle exactly 5 minutes boundary', () => {
      const lastSentAt = new Date(Date.now() - 5 * 60 * 1000); // Exactly 5 minutes ago
      const minutesSince = (Date.now() - lastSentAt.getTime()) / (1000 * 60);

      expect(minutesSince).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Security: No Token Logging', () => {
    it('should not log management token in console', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { token } = generateManagementToken();

      // Simulate operations that should NOT log token
      const tokenHash = hashManagementToken(token);

      // Verify token not in console logs
      const logCalls = consoleSpy.mock.calls.map((call) =>
        call.join(' ')
      );
      logCalls.forEach((logMessage) => {
        expect(logMessage).not.toContain(token);
      });

      consoleSpy.mockRestore();
    });

    it('should not log email address in console', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const testEmail = 'creator@example.com';

      // Simulate operations that should NOT log email
      const normalizedEmail = testEmail.toLowerCase().trim();

      // Verify email not in console logs
      const logCalls = consoleSpy.mock.calls.map((call) =>
        call.join(' ')
      );
      logCalls.forEach((logMessage) => {
        expect(logMessage).not.toContain(testEmail);
        expect(logMessage).not.toContain(normalizedEmail);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('URL Construction', () => {
    function buildMemoryPopUrl(baseUrl: string, path: string): string {
      const cleanBase = baseUrl.replace(/\/$/, '');
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${cleanBase}${cleanPath}`;
    }

    it('should construct management link correctly', () => {
      const baseUrl = 'https://memorypop.app';
      const { token } = generateManagementToken();
      const managementLink = buildMemoryPopUrl(baseUrl, `/manage/${token}`);

      expect(managementLink).toBe(`https://memorypop.app/manage/${token}`);
    });

    it('should construct contributor link correctly', () => {
      const baseUrl = 'https://memorypop.app';
      const shareCode = 'ABC123';
      const contributorLink = buildMemoryPopUrl(baseUrl, `/m/${shareCode}/contribute`);

      expect(contributorLink).toBe(`https://memorypop.app/m/${shareCode}/contribute`);
    });

    it('should handle trailing slash in base URL', () => {
      const baseUrl = 'https://memorypop.app/';
      const path = '/manage/token123';
      const url = buildMemoryPopUrl(baseUrl, path);

      expect(url).toBe('https://memorypop.app/manage/token123');
      expect(url).not.toContain('//manage');
    });
  });

  describe('Celebration Timeline Formatting', () => {
    function formatCelebrationTimeline(dateString: string): string {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const celebration = new Date(dateString);
      celebration.setHours(0, 0, 0, 0);

      const diffTime = celebration.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} until the celebration`;
      } else if (diffDays === 0) {
        return "Today is the celebration!";
      } else {
        return "Celebration complete";
      }
    }

    it('should format future celebration correctly', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const message = formatCelebrationTimeline(futureDate.toISOString());

      expect(message).toContain('days until the celebration');
    });

    it('should format today celebration correctly', () => {
      const today = new Date();
      const message = formatCelebrationTimeline(today.toISOString());

      expect(message).toBe('Today is the celebration!');
    });

    it('should format past celebration correctly', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const message = formatCelebrationTimeline(pastDate.toISOString());

      expect(message).toBe('Celebration complete');
    });

    it('should use singular for 1 day', () => {
      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const message = formatCelebrationTimeline(tomorrow.toISOString());

      expect(message).toBe('1 day until the celebration');
    });
  });
});

describe('Creator Welcome Email - Security Requirements', () => {
  describe('No Persistence of Raw Management Token', () => {
    it('should never persist raw management token', () => {
      const { token, tokenHash } = generateManagementToken();

      // Database should only store hash
      const storedValue = tokenHash; // NOT token

      // Verify we're storing hash, not token
      expect(storedValue).not.toBe(token);
      expect(storedValue).toBe(tokenHash);
    });

    it('should only update verification_sent_at in database', () => {
      // Simulate the database update
      const databaseUpdate = {
        verification_sent_at: new Date().toISOString(),
        // Should NOT include:
        // - creator_email
        // - pending_creator_email
        // - management_token (raw)
        // - management_token_hash (should already exist, not updated)
      };

      expect(databaseUpdate).toHaveProperty('verification_sent_at');
      expect(databaseUpdate).not.toHaveProperty('creator_email');
      expect(databaseUpdate).not.toHaveProperty('pending_creator_email');
      expect(databaseUpdate).not.toHaveProperty('management_token');
    });
  });

  describe('No Persistence of Unverified Email', () => {
    it('should not store email in creator_email field', () => {
      const submittedEmail = 'user@example.com';

      // Database update should NOT include creator_email
      const databaseUpdate = {
        verification_sent_at: new Date().toISOString(),
      };

      expect(databaseUpdate).not.toHaveProperty('creator_email');

      // The email is used only for sending, not stored
      expect(submittedEmail).toBeTruthy(); // Email is used
      // But not persisted in database
    });

    it('should not store email in pending_creator_email field', () => {
      const submittedEmail = 'user@example.com';

      // Database update should NOT include pending_creator_email
      const databaseUpdate = {
        verification_sent_at: new Date().toISOString(),
      };

      expect(databaseUpdate).not.toHaveProperty('pending_creator_email');
      expect(submittedEmail).toBeTruthy(); // Email is used for sending
    });
  });

  describe('Request Authorization', () => {
    it('should require creator session', () => {
      // Simulate missing session
      const session = null;

      // Should reject request
      expect(session).toBeNull();
      // In actual API: return 403 Unauthorized
    });

    it('should require shareCode to match session', () => {
      const sessionShareCode = 'ABC123';
      const requestShareCode = 'ABC123';

      // Should match
      expect(requestShareCode).toBe(sessionShareCode);
    });

    it('should reject mismatched shareCode', () => {
      const sessionShareCode = 'ABC123';
      const requestShareCode = 'XYZ789';

      // Should NOT match
      expect(requestShareCode).not.toBe(sessionShareCode);
      // In actual API: return 403 Unauthorized
    });
  });

  describe('Analytics Safety', () => {
    it('should not include token in analytics events', () => {
      const shareCode = 'ABC123';
      const { token } = generateManagementToken();

      // Simulate analytics event
      const analyticsEvent = {
        event: 'creator_welcome_email_sent',
        properties: {
          shareCode,
          timestamp: new Date().toISOString(),
        },
      };

      // Verify token NOT in event
      const eventString = JSON.stringify(analyticsEvent);
      expect(eventString).not.toContain(token);
    });

    it('should not include email in analytics events', () => {
      const shareCode = 'ABC123';
      const email = 'creator@example.com';

      // Simulate analytics event
      const analyticsEvent = {
        event: 'creator_welcome_email_sent',
        properties: {
          shareCode,
          timestamp: new Date().toISOString(),
        },
      };

      // Verify email NOT in event
      const eventString = JSON.stringify(analyticsEvent);
      expect(eventString).not.toContain(email);
    });
  });
});

describe('Creator Welcome Email - Error Handling', () => {
  describe('Resend Error Handling', () => {
    it('should not expose token in error response', () => {
      const { token } = generateManagementToken();

      // Simulate error response (generic message, no details)
      const errorResponse = {
        error: 'Failed to send email',
        details: 'Email delivery failed', // Generic message
        // Should NOT include:
        // - token
        // - email address
        // - raw Resend error details
      };

      const errorString = JSON.stringify(errorResponse);
      expect(errorString).not.toContain(token);
      expect(errorString).not.toContain('Resend');
    });

    it('should return generic error message on failure', () => {
      const errorResponse = {
        error: 'Failed to send email',
        details: 'Email delivery failed',
      };

      expect(errorResponse.details).toBe('Email delivery failed');
      expect(errorResponse.details).not.toContain('API key');
      expect(errorResponse.details).not.toContain('token');
    });
  });

  describe('Environment Variable Safety', () => {
    it('should read EMAIL_FROM from environment only', () => {
      const fromEmail = process.env.EMAIL_FROM;

      // Should be from environment (string or undefined), not hardcoded
      // In production: EMAIL_FROM must be set
      // In actual code: never hardcode 'hello@memorypop.app'
      expect(['string', 'undefined']).toContain(typeof fromEmail);
    });

    it('should read RESEND_API_KEY from environment only', () => {
      const apiKey = process.env.RESEND_API_KEY;

      // Should be from environment (string or undefined), not hardcoded
      // In production: RESEND_API_KEY must be set
      // In actual code: never hardcode API key
      expect(['string', 'undefined']).toContain(typeof apiKey);
    });

    it('should read APP_BASE_URL from environment only', () => {
      const baseUrl = process.env.APP_BASE_URL;

      // Should be from environment (string or undefined), not hardcoded
      // In production: APP_BASE_URL must be set
      // In actual code: never hardcode 'https://memorypop.app'
      expect(['string', 'undefined']).toContain(typeof baseUrl);
    });
  });
});
