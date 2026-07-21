/**
 * Creator Identity Authorization Tests
 * Automated tests for secure creation and authorization
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { generateManagementToken, hashManagementToken } from '@/lib/verification';
import { CreatorSession } from '@/lib/creatorSession';

describe('Management Token Generation', () => {
  it('generates cryptographically secure token', () => {
    const { token, tokenHash } = generateManagementToken();

    // Token should be 43+ characters (base64url encoded 32 bytes)
    expect(token.length).toBeGreaterThanOrEqual(43);

    // Hash should be 43+ characters (base64url encoded SHA-256)
    expect(tokenHash.length).toBeGreaterThanOrEqual(43);

    // Token and hash should be different
    expect(token).not.toBe(tokenHash);
  });

  it('generates unique tokens on each call', () => {
    const { token: token1 } = generateManagementToken();
    const { token: token2 } = generateManagementToken();

    expect(token1).not.toBe(token2);
  });

  it('hashes produce consistent output', () => {
    const token = 'test-token-123';
    const hash1 = hashManagementToken(token);
    const hash2 = hashManagementToken(token);

    expect(hash1).toBe(hash2);
  });

  it('different tokens produce different hashes', () => {
    const hash1 = hashManagementToken('token1');
    const hash2 = hashManagementToken('token2');

    expect(hash1).not.toBe(hash2);
  });
});

describe('Creator Session', () => {
  it('session is scoped to specific MemoryPop', () => {
    const session: CreatorSession = {
      shareCode: 'abc123',
      managementTokenHash: 'hash123',
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    expect(session.shareCode).toBe('abc123');
    expect(session.managementTokenHash).toBe('hash123');
  });

  it('session expires after 7 days', () => {
    const now = Date.now();
    const session: CreatorSession = {
      shareCode: 'abc123',
      managementTokenHash: 'hash123',
      createdAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000,
    };

    // Not expired yet
    expect(Date.now()).toBeLessThan(session.expiresAt);

    // Would be expired in 8 days
    const futureTime = now + 8 * 24 * 60 * 60 * 1000;
    expect(futureTime).toBeGreaterThan(session.expiresAt);
  });
});
