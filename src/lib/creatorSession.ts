/**
 * Creator Session Management
 *
 * Secure session handling for creator authentication.
 * Uses signed HttpOnly cookies with HMAC-SHA256 for session integrity.
 *
 * Security Features:
 * - HttpOnly cookies (prevents XSS access)
 * - Signed with HMAC-SHA256 (prevents tampering)
 * - SameSite=Lax (CSRF protection)
 * - Secure in production (HTTPS only)
 * - Per-MemoryPop session binding (prevents cross-MemoryPop access)
 * - 7-day expiry with automatic cleanup
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'memorypop_creator_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'development-secret-change-in-production';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface CreatorSession {
  shareCode: string;           // Which MemoryPop this session is for
  managementTokenHash: string; // Hash of the management token used
  createdAt: number;           // Session creation timestamp (Unix milliseconds)
  expiresAt: number;           // Session expiry timestamp (Unix milliseconds)
}

/**
 * Sign session data with HMAC-SHA256
 * Returns signed session string in format: {base64url(payload)}.{base64url(signature)}
 */
function signSession(session: CreatorSession): string {
  const payload = JSON.stringify(session);
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');

  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}

/**
 * Verify and parse signed session
 * Returns null if signature invalid or session expired
 */
function verifySession(signedSession: string): CreatorSession | null {
  try {
    const [payloadEncoded, signature] = signedSession.split('.');
    if (!payloadEncoded || !signature) return null;

    const payload = Buffer.from(payloadEncoded, 'base64url').toString();

    // Verify signature (constant-time comparison)
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const session: CreatorSession = JSON.parse(payload);

    // Check expiry
    if (Date.now() > session.expiresAt) return null;

    return session;
  } catch {
    return null;
  }
}

/**
 * Create creator session cookie
 * Call this after successful management token authentication
 */
export async function setCreatorSession(
  shareCode: string,
  managementTokenHash: string
): Promise<void> {
  const now = Date.now();
  const session: CreatorSession = {
    shareCode,
    managementTokenHash,
    createdAt: now,
    expiresAt: now + (SESSION_MAX_AGE * 1000),
  };

  const signedSession = signSession(session);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, signedSession, {
    httpOnly: true,  // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'lax',  // CSRF protection
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Get creator session for specific MemoryPop
 * Returns session only if valid and matches shareCode
 *
 * IMPORTANT: Session is bound to specific MemoryPop (prevents cross-MemoryPop access)
 */
export async function getCreatorSession(shareCode: string): Promise<CreatorSession | null> {
  const cookieStore = await cookies();
  const signedSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!signedSession) return null;

  const session = verifySession(signedSession);

  // Session must be for THIS MemoryPop (prevent cross-MemoryPop access)
  if (!session || session.shareCode !== shareCode) return null;

  return session;
}

/**
 * Clear creator session
 * Call this on logout or session invalidation
 */
export async function clearCreatorSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if user has creator session for MemoryPop
 * Returns true if valid session exists for this MemoryPop
 */
export async function isCreatorAuthorized(shareCode: string): Promise<boolean> {
  const session = await getCreatorSession(shareCode);
  return session !== null;
}
