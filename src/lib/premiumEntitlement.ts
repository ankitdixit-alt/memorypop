/**
 * Premium Entitlement Logic
 *
 * Determines whether a MemoryPop has access to the Premium Experience.
 *
 * Current (Private Beta):
 * - Check database is_premium flag OR
 * - Check ENABLE_PREMIUM_BETA feature flag
 *
 * Future (Post-Beta with Stripe):
 * - Check database is_premium flag (set by Stripe webhook)
 * - Feature flag removed or set to false
 *
 * This design allows Stripe integration to replace beta flag
 * without changing reveal components.
 */

interface MemoryPop {
  id: string;
  is_premium: boolean;
  // ... other fields
}

/**
 * Check if a MemoryPop has access to Premium Experience
 *
 * @param memoryPop - MemoryPop data from database
 * @returns true if Premium Experience is available
 */
export function hasPremiumAccess(memoryPop: MemoryPop): boolean {
  // Check database flag (set by Stripe payment in production)
  if (memoryPop.is_premium) {
    return true;
  }

  // Check beta feature flag (temporary for Private Beta)
  const betaEnabled = process.env.ENABLE_PREMIUM_BETA === 'true';
  if (betaEnabled) {
    return true;
  }

  return false;
}

/**
 * Get Premium access reason (for debugging/analytics)
 *
 * @param memoryPop - MemoryPop data from database
 * @returns reason string or null
 */
export function getPremiumAccessReason(memoryPop: MemoryPop): string | null {
  if (memoryPop.is_premium) {
    return 'paid'; // Stripe payment unlocked Premium
  }

  const betaEnabled = process.env.ENABLE_PREMIUM_BETA === 'true';
  if (betaEnabled) {
    return 'beta'; // Beta feature flag grants access
  }

  return null;
}

/**
 * Future Stripe Integration Point
 *
 * When Stripe is added:
 * 1. Stripe checkout sets is_premium = true on successful payment
 * 2. Stripe webhook confirms payment and updates database
 * 3. hasPremiumAccess() automatically returns true
 * 4. Remove or set ENABLE_PREMIUM_BETA=false
 * 5. No changes needed to reveal components
 *
 * The reveal experience is payment-method agnostic.
 * It only checks: "Does this MemoryPop have Premium access?"
 */
