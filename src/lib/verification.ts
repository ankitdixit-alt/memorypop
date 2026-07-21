/**
 * Email Verification Utilities
 * Sprint 1: Security Fix - Cryptographically secure token generation and validation
 *
 * Security Requirements:
 * - Generate cryptographically secure random tokens (256 bits)
 * - Store SHA-256 hash only, never plaintext
 * - 24-hour expiry
 * - Single-use tokens
 * - Rate limiting (5 failed attempts)
 */

import { randomBytes, createHash } from 'crypto';

const TOKEN_LENGTH = 32; // 32 bytes = 256 bits
const TOKEN_EXPIRY_HOURS = 24;
const MAX_VERIFICATION_ATTEMPTS = 5;

export interface VerificationToken {
  token: string;      // Raw token (send in email, never store)
  tokenHash: string;  // SHA-256 hash (store in database)
  expiresAt: Date;    // 24 hours from now
}

/**
 * Generate secure verification token
 * Uses Node.js crypto.randomBytes for cryptographically secure randomness
 * Returns both raw token (for email) and hash (for storage)
 *
 * @returns Token object with raw token and hash
 */
export function generateVerificationToken(): VerificationToken {
  // Generate cryptographically secure random token
  // base64url encoding is URL-safe (no +, /, or = padding)
  const token = randomBytes(TOKEN_LENGTH).toString('base64url');

  // Hash token for storage using SHA-256
  const tokenHash = createHash('sha256')
    .update(token)
    .digest('base64url');

  // Set 24-hour expiry
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

  return { token, tokenHash, expiresAt };
}

/**
 * Hash a token for comparison
 * Used to hash user-provided tokens before database lookup
 *
 * @param token - Raw token from user
 * @returns Token hash (SHA-256, base64url)
 */
export function hashToken(token: string): string {
  return createHash('sha256')
    .update(token)
    .digest('base64url');
}

/**
 * Check if token is expired
 * Compares expiry timestamp against current time
 *
 * @param expiresAt - Expiry timestamp (Date or ISO string)
 * @returns true if expired
 */
export function isTokenExpired(expiresAt: Date | string): boolean {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiry < new Date();
}

/**
 * Check if verification attempts exceeded
 * Enforces rate limiting to prevent brute force attacks
 *
 * @param attempts - Current attempt count
 * @returns true if exceeded (5 or more attempts)
 */
export function isVerificationLocked(attempts: number): boolean {
  return attempts >= MAX_VERIFICATION_ATTEMPTS;
}

/**
 * Generate cryptographically secure management token
 * Returns raw token (send to user) and hash (store in database)
 *
 * Management tokens are used for creator authentication (separate from public shareCode)
 * NEVER store plaintext tokens - always store hash only
 *
 * @returns Object with raw token and SHA-256 hash
 */
export function generateManagementToken(): { token: string; tokenHash: string } {
  // Generate 32 bytes (256 bits) of cryptographic randomness
  const token = randomBytes(32).toString('base64url');

  // Hash for database storage
  const tokenHash = createHash('sha256')
    .update(token)
    .digest('base64url');

  return { token, tokenHash };
}

/**
 * Hash management token for validation
 * Used to hash user-provided management tokens before database lookup
 *
 * @param token - Raw management token
 * @returns SHA-256 hash (base64url encoded)
 */
export function hashManagementToken(token: string): string {
  return createHash('sha256')
    .update(token)
    .digest('base64url');
}
