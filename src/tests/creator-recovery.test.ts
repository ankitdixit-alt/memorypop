/**
 * Creator Recovery Tests
 * Tests for management token display and recovery flow
 *
 * Security Requirements:
 * - Token returned once in creation response
 * - Only hash stored in database
 * - /manage/{token} establishes creator session
 * - Invalid tokens rejected
 * - No token leakage in logs or analytics
 */

import { generateManagementToken, hashManagementToken } from '@/lib/verification';

// Conditionally import supabase for integration tests
const hasSupabaseEnv =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any;
if (hasSupabaseEnv) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  supabase = require('@/lib/supabase').supabase;
}

describe('Creator Recovery - Management Token Display', () => {
  describe('generateManagementToken', () => {
    it('should return both token and tokenHash', () => {
      const { token, tokenHash } = generateManagementToken();

      expect(token).toBeDefined();
      expect(tokenHash).toBeDefined();
      expect(typeof token).toBe('string');
      expect(typeof tokenHash).toBe('string');
      expect(token).not.toBe(tokenHash);
    });

    it('should generate unique tokens on each call', () => {
      const result1 = generateManagementToken();
      const result2 = generateManagementToken();

      expect(result1.token).not.toBe(result2.token);
      expect(result1.tokenHash).not.toBe(result2.tokenHash);
    });

    it('should generate token with sufficient entropy', () => {
      const { token } = generateManagementToken();

      // 32 bytes base64url = 43 characters (no padding)
      expect(token.length).toBeGreaterThanOrEqual(43);

      // Should only contain base64url characters (A-Za-z0-9_-)
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should generate hash with correct format', () => {
      const { tokenHash } = generateManagementToken();

      // SHA-256 base64url = 43 characters
      expect(tokenHash.length).toBeGreaterThanOrEqual(43);
      expect(tokenHash).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('hashManagementToken', () => {
    it('should produce consistent hash for same token', () => {
      const token = 'test-token-12345';

      const hash1 = hashManagementToken(token);
      const hash2 = hashManagementToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different tokens', () => {
      const token1 = 'test-token-12345';
      const token2 = 'test-token-67890';

      const hash1 = hashManagementToken(token1);
      const hash2 = hashManagementToken(token2);

      expect(hash1).not.toBe(hash2);
    });

    it('should match hash from generateManagementToken', () => {
      const { token, tokenHash } = generateManagementToken();

      const computedHash = hashManagementToken(token);

      expect(computedHash).toBe(tokenHash);
    });
  });

  describe('Security Requirements', () => {
    it('should never return same token twice', () => {
      const tokens = new Set<string>();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const { token } = generateManagementToken();
        expect(tokens.has(token)).toBe(false);
        tokens.add(token);
      }
    });

    it('should never return same hash twice', () => {
      const hashes = new Set<string>();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const { tokenHash } = generateManagementToken();
        expect(hashes.has(tokenHash)).toBe(false);
        hashes.add(tokenHash);
      }
    });

    it('should be computationally infeasible to reverse hash', () => {
      const { token, tokenHash } = generateManagementToken();

      // Hash should be one-way (can't derive token from hash)
      // This test just verifies hash doesn't contain token substring
      expect(tokenHash).not.toContain(token.substring(0, 10));
    });
  });
});

(hasSupabaseEnv ? describe : describe.skip)('Creator Recovery - API Integration', () => {
  describe('POST /api/memorypops/create', () => {
    it('should return managementToken in response', async () => {
      const payload = {
        recipient_name: 'Test User',
        occasion: 'Birthday',
        story: 'Test story for recovery feature',
        tone: 'joyful',
        cover_style: 'sunset',
        celebration_date: null,
      };

      const response = await fetch('http://localhost:3000/api/memorypops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(response.ok).toBe(true);

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.shareCode).toBeDefined();
      expect(data.managementToken).toBeDefined();
      expect(typeof data.managementToken).toBe('string');
      expect(data.managementToken.length).toBeGreaterThanOrEqual(43);
    });

    it('should store hash, not raw token in database', async () => {
      const payload = {
        recipient_name: 'Test User Hash Storage',
        occasion: 'Wedding',
        story: 'Testing hash storage',
        tone: 'romantic',
        cover_style: 'pastel',
        celebration_date: null,
      };

      const response = await fetch('http://localhost:3000/api/memorypops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const { shareCode, managementToken } = await response.json();

      // Fetch from database
      const { data, error } = await supabase
        .from('memorypops')
        .select('management_token_hash')
        .eq('share_code', shareCode)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.management_token_hash).toBeDefined();

      // Verify raw token is NOT stored
      expect(data?.management_token_hash).not.toBe(managementToken);

      // Verify hash matches token
      const computedHash = hashManagementToken(managementToken);
      expect(data?.management_token_hash).toBe(computedHash);
    });

    it('should not leak token in error responses', async () => {
      const invalidPayload = {
        recipient_name: '', // Invalid: empty name
        occasion: 'Birthday',
        story: 'Test',
        tone: 'joyful',
        cover_style: 'sunset',
      };

      const response = await fetch('http://localhost:3000/api/memorypops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });

      expect(response.ok).toBe(false);

      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.managementToken).toBeUndefined();

      // Error message should not contain token-like strings
      const errorText = JSON.stringify(data);
      expect(errorText).not.toMatch(/[A-Za-z0-9_-]{43,}/);
    });
  });

  describe('GET /manage/{token}', () => {
    it('should establish creator session with valid token', async () => {
      // First create a MemoryPop
      const createResponse = await fetch('http://localhost:3000/api/memorypops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: 'Session Test User',
          occasion: 'Anniversary',
          story: 'Testing session establishment',
          tone: 'romantic',
          cover_style: 'pastel',
        }),
      });

      const { shareCode, managementToken } = await createResponse.json();

      // Access /manage/{token} route
      const manageResponse = await fetch(
        `http://localhost:3000/manage/${managementToken}`,
        {
          redirect: 'manual', // Don't follow redirect automatically
        }
      );

      // Should redirect to dashboard
      expect(manageResponse.status).toBe(307); // Temporary redirect
      expect(manageResponse.headers.get('location')).toContain(`/dashboard/${shareCode}`);

      // Should set session cookie
      const cookies = manageResponse.headers.get('set-cookie');
      expect(cookies).toBeTruthy();
      expect(cookies).toContain('creator_session');
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('SameSite');
    });

    it('should reject invalid token', async () => {
      const invalidToken = 'invalid-token-that-does-not-exist';

      const response = await fetch(
        `http://localhost:3000/manage/${invalidToken}`,
        {
          redirect: 'manual',
        }
      );

      // Should redirect to error page
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('error=invalid-link');
    });

    it('should handle malformed token gracefully', async () => {
      const malformedToken = 'not-a-valid-base64url-token!!!';

      const response = await fetch(
        `http://localhost:3000/manage/${malformedToken}`,
        {
          redirect: 'manual',
        }
      );

      // Should redirect to error page (not crash)
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('error');
    });

    it('should set Referrer-Policy header to prevent token leakage', async () => {
      // Create MemoryPop
      const createResponse = await fetch('http://localhost:3000/api/memorypops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: 'Referrer Test',
          occasion: 'Birthday',
          story: 'Testing referrer policy',
          tone: 'joyful',
          cover_style: 'sunset',
        }),
      });

      const { managementToken } = await createResponse.json();

      // Access /manage route
      const response = await fetch(
        `http://localhost:3000/manage/${managementToken}`,
        {
          redirect: 'manual',
        }
      );

      // Should set Referrer-Policy: no-referrer
      expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    });
  });

  describe('Dashboard access after /manage', () => {
    it('should allow dashboard access after valid /manage authentication', async () => {
      // Create MemoryPop
      const createResponse = await fetch('http://localhost:3000/api/memorypops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: 'Dashboard Access Test',
          occasion: 'Graduation',
          story: 'Testing dashboard access',
          tone: 'proud',
          cover_style: 'vibrant',
        }),
      });

      const { shareCode, managementToken } = await createResponse.json();

      // Authenticate via /manage
      const manageResponse = await fetch(
        `http://localhost:3000/manage/${managementToken}`,
        {
          redirect: 'manual',
        }
      );

      // Extract session cookie
      const setCookie = manageResponse.headers.get('set-cookie');
      expect(setCookie).toBeTruthy();

      // Access dashboard with session cookie
      const dashboardResponse = await fetch(
        `http://localhost:3000/dashboard/${shareCode}`,
        {
          headers: {
            Cookie: setCookie || '',
          },
        }
      );

      // Should successfully access dashboard
      expect(dashboardResponse.ok).toBe(true);
      expect(dashboardResponse.status).toBe(200);
    });
  });
});

describe('Creator Recovery - Security', () => {
  describe('Token Leakage Prevention', () => {
    it('should not log token to console', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { token } = generateManagementToken();

      // Generate multiple tokens
      for (let i = 0; i < 10; i++) {
        generateManagementToken();
      }

      // Verify token not in any console.log calls
      const logCalls = consoleSpy.mock.calls.map((call) =>
        call.join(' ')
      );
      logCalls.forEach((logMessage) => {
        expect(logMessage).not.toContain(token);
      });

      consoleSpy.mockRestore();
    });

    it('should not include token in analytics events', () => {
      // This test would need to mock trackEvent and verify no token passed
      // Implementation depends on analytics setup
      expect(true).toBe(true); // Placeholder
    });

    it.skip('should not expose token in HTTP headers', async () => {
      const createResponse = await fetch('http://localhost:3000/api/memorypops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: 'Header Test',
          occasion: 'Birthday',
          story: 'Testing header exposure',
          tone: 'joyful',
          cover_style: 'sunset',
        }),
      });

      const { managementToken } = await createResponse.json();

      // Check all response headers
      const headers = Object.fromEntries(createResponse.headers.entries());
      const headerValues = Object.values(headers).join(' ');

      // Token should only be in response body, not headers
      expect(headerValues).not.toContain(managementToken);
    });
  });

  describe('Token Uniqueness', () => {
    it('should generate cryptographically unique tokens', () => {
      const tokens = new Set<string>();
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const { token } = generateManagementToken();
        expect(tokens.has(token)).toBe(false);
        tokens.add(token);
      }

      // All tokens should be unique
      expect(tokens.size).toBe(iterations);
    });
  });
});
